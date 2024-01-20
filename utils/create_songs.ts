import path from 'node:path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { parseStringPromise } from 'xml2js';
import { command, run, string, positional } from 'cmd-ts';
import { ParseSpan } from '@angular/compiler';
import { ListBooks, ListServices, ListSongs } from '../src/lib/init';
import { Book } from '../src/lib/book';
import { Service } from '../src/lib/service';
import { Song } from '../src/lib/song';

const app = command({
    name: 'create_songs',
    args: {
        songs: positional({ type: string, displayName: 'song file' }),
    },
    handler: ({ songs }) => {
        convertSong(songs);
    },
});

run(app, process.argv.slice(2));

async function convertSong(file: string) {
    const fileContents = fs.readFileSync(file, 'utf8');
    const data = yaml.parse(fileContents);
    if (!fs.existsSync(data.sets)) {
        throw new Error(`Didn't find directory ${data.sets}`);
    }

    const books: Book[] = [];
    const songs: Song[] = [];
    for (const [abb, desc] of Object.entries(data.books) as [string, any]) {
        books.push(new Book(abb, desc.name))
        songs.push(...(await readSongs(books.length - 1, abb, desc.path)));
    }

    const services = await readServices(books, songs, data.sets);

    fs.writeFileSync("../src/assets/books.json", JSON.stringify(books));
    fs.writeFileSync("../src/assets/songs.json", JSON.stringify(songs));
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

async function readSongs(bookNbr: number, bookAbb: string, songPath: string): Promise<Song[]> {
    const songs: Song[] = [];

    if (!fs.existsSync(songPath)) {
        throw new Error(`Didn't find song-path ${songPath}`);
    }

    const regexp = new RegExp(`${bookAbb} ?([0-9]*):?\\s(.*)`); // Regular expression for a single space character

    const songFiles = fs.readdirSync(songPath);
    songFiles.sort();
    for (const songFile of songFiles) {
        const songFilePath = path.join(songPath, songFile);
        if (!fs.statSync(songFilePath).isFile()) {
            console.error(`Found non-file ${songFile}`)
            continue
        }
        const song = await parseStringPromise(fs.readFileSync(songFilePath));
        const fullTitle = song.song.title[0];
        if (!fullTitle.startsWith(bookAbb)) {
            console.error(`Found song title ${fullTitle} not starting with ${bookAbb}`);
            continue;
        }
        // console.log(`${fullTitle} - ${fullTitle.match(regexp)}`);
        try {
            const [_, songNbrStr, title] = song.song.title[0].match(regexp);
            const songNbr = parseInt(songNbrStr);
            // console.log(`${fullTitle}:: ${songNbr} - ${title}`);
            songs.push(new Song(bookNbr, songNbr, title, song.song.lyrics[0]));
            // break;
        } catch (e) {
            console.log(`While parsing ${fullTitle}, got error ${e}`);
        }
    }

    return songs;
}