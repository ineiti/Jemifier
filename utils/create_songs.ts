import path from 'node:path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { parseStringPromise } from 'xml2js';
import { command, run, string, positional } from 'cmd-ts';
import { Book } from '../src/lib/book';
import { Service } from '../src/lib/service';
import { Song } from '../src/lib/song';

const app = command({
    name: 'create_songs',
    args: {
        songs: positional({ type: string, displayName: 'configuration file' }),
    },
    handler: ({ songs }) => {
        createSongs(songs);
    },
});

run(app, process.argv.slice(2));

async function createSongs(file: string) {
    const fileContents = fs.readFileSync(file, 'utf8');
    const data = yaml.parse(fileContents);

    const books: Book[] = [];
    const songs: Song[] = [];
    for (const [abb, desc] of Object.entries(data.books) as [string, any]) {
        books.push(new Book(abb, desc.name))
        songs.push(...(await readSongs(books.length - 1, abb, desc.path)));
    }

    fs.writeFileSync("../src/assets/books.json", JSON.stringify(books));
    fs.writeFileSync("../src/assets/songs.json", JSON.stringify(songs));
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
            songs.push(new Song({ book_id: bookNbr, number: songNbr, title: title, lyrics: song.song.lyrics[0] }));
            // break;
        } catch (e) {
            console.log(`While parsing ${fullTitle}, got error ${e}`);
        }
    }

    return songs;
}