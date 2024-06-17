import path from 'node:path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { parseStringPromise } from 'xml2js';
import { command, run, string, positional } from 'cmd-ts';
import { Book } from '../src/lib/book';
import { Service } from '../src/lib/service';
import { Song } from '../src/lib/song';
import { ListBooks } from '../src/lib/init';
import { ListSongs } from "../src/lib/song";

const app = command({
    name: 'create_services',
    args: {
        songs: positional({ type: string, displayName: 'configuration file' }),
    },
    handler: ({ songs }) => {
        createServices(songs);
    },
});

run(app, process.argv.slice(2));

async function createServices(configFile: string) {
    const fileContents = fs.readFileSync(configFile, 'utf8');
    const config = yaml.parse(fileContents);
    if (!fs.existsSync(config.sets)) {
        throw new Error(`Didn't find directory ${config.sets}`);
    }

    const songs_name = "../src/assets/songs.json";
    const books_name = "../src/assets/books.json";
    if (!fs.existsSync(songs_name)) {
        throw new Error(`Didn't find songs at ${songs_name}`);
    }
    if (!fs.existsSync(books_name)) {
        throw new Error(`Didn't find books at ${books_name}`);
    }

    const listBooks = new ListBooks(fs.readFileSync(books_name, "utf-8"));
    const listSongs = new ListSongs(fs.readFileSync(songs_name, "utf-8"));

    const services = await readServices(listBooks.books, listSongs.songs, config.sets);
    fs.writeFileSync("../src/assets/services.json", JSON.stringify(services));
}

async function readServices(books: Book[], songs: Song[], sets_dir: string): Promise<Service[]> {
    const services: Service[] = [];

    const sets = fs.readdirSync(sets_dir);
    sets.sort();
    for (const set of sets) {
        try {
            const set_first_path = fs.readFileSync(path.join(sets_dir, set), 'utf8');
            const set_first = await parseStringPromise(set_first_path);

            console.log(`Parsing set ${set}`);
            const songIds = [];
            for (const sg of set_first.set.slide_groups[0].slide_group.filter((t: any) => t.$.type === "song")) {
                const regexp = new RegExp(`([^ 0-9]*) ?([0-9]*):?\\s(.*)`); // Regular expression for a single space character
                const matches = sg.$.name.match(regexp);
                if (matches === null) {
                    if (sg.$.name !== "Texte_vide") {
                        console.warn(`Couldn't find match for ${sg.$.name}`);
                    }
                    continue;
                }
                const [_, bookAbb, songNbrStr, title] = matches;
                const bookId = books.findIndex((b) => b.abbreviation === bookAbb);
                if (bookId < 0) {
                    console.warn(`Didn't find book for song ${bookAbb} - ${songNbrStr} - ${title}`);
                    continue;
                }
                const songNbr = parseInt(songNbrStr);
                const songId = songs.findIndex((s) => s.book_id === bookId && s.number === songNbr);
                if (songId < 0) {
                    console.warn(`Didn't find song in list for ${bookAbb} - ${songNbr} - ${title}`)
                    continue;
                }
                songIds.push(songId);
                // console.log(`Found ${bookAbb} - ${songNbr} - ${title} for ${sg.$.name}`);
            }
            const [dateStr, _] = set.split("_");
            const date = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
            services.push(new Service(date, songIds))
        } catch (e) {
            console.error(`Error while trying to read file ${set}: ${e}`);
        }
    }

    return services;
}
