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

    const sets = fs.readdirSync(data.sets);
    const set_first_path = fs.readFileSync(path.join(data.sets, sets[0]), 'utf8');
    const set_first = await parseStringPromise(set_first_path);
    // console.dir(set_first.set.slide_groups[0].slide_group);
    for (const sg of set_first.set.slide_groups[0].slide_group.filter((t: any) => t.$.type == "song")) {
        console.dir(sg.$.name);
    }
}

async function readSongs(bookNbr: number, bookAbb: string, songPath: string): Promise<Song[]> {
    const songs: Song[] = [];

    if (!fs.existsSync(songPath)) {
        throw new Error(`Didn't find song-path ${songPath}`);
    }

    const regexp = new RegExp(`${bookAbb} ?([0-9]*):?\\s(.*)`); // Regular expression for a single space character

    for (const songFile of fs.readdirSync(songPath)) {
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
            const [_, songNbr, title] = song.song.title[0].match(regexp);
            // console.log(`${fullTitle}:: ${songNbr} - ${title}`);
            songs.push(new Song(bookNbr, songNbr, title, song.song.lyrics[0]));
            // break;
        } catch (e) {
            console.log(`While parsing ${fullTitle}, got error ${e}`);
        }
    }

    return songs;
}