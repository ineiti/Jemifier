import path from 'node:path';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { parseStringPromise } from 'xml2js';
import { command, run, string, positional } from 'cmd-ts';
import { Book } from '../src/lib/book';
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
        if (desc.path !== undefined) {
            songs.push(...(await readOpenSongs(books.length - 1, abb, desc.path)));
        } else if (desc.chord !== undefined) {
            songs.push(...(await readChordSongs(books.length - 1, abb, desc.chord)));
        }
    }

    fs.writeFileSync("../src/assets/books.json", JSON.stringify(books));
    fs.writeFileSync("../src/assets/songs.json", JSON.stringify(songs));
}

async function readOpenSongs(bookNbr: number, bookAbb: string, songPath: string): Promise<Song[]> {
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
            songs.push(new Song(-1, {
                book_id: bookNbr, number: songNbr, title: title, lyrics: song.song.lyrics[0],
                author: song.song.author[0]
            }));
            // break;
        } catch (e) {
            console.log(`While parsing ${fullTitle}, got error ${e}`);
        }
    }

    return songs;
}

async function readChordSongs(bookNbr: number, bookAbb: string, songPath: string): Promise<Song[]> {
    const songs: Song[] = [];

    if (!fs.existsSync(songPath)) {
        throw new Error(`Didn't find song-path ${songPath}`);
    }

    const songFiles = fs.readdirSync(songPath);
    songFiles.sort((a, b) => parseInt(a.match(/([0-9]+)/)![1]) - parseInt(b.match(/([0-9]+)/)![1]));
    for (const songFile of songFiles) {
        const songFilePath = path.join(songPath, songFile);
        if (!fs.statSync(songFilePath).isFile()) {
            console.error(`Found non-file ${songFile}`)
            continue
        }

        const lines = fs.readFileSync(songFilePath).toString("utf-8").replaceAll("–", "-").split("\n");
        try {
            const song = parseChord(bookNbr, bookAbb, lines);
            songs.push(song);
            console.log(`Successfully parsed ${bookAbb}${song.number} - ${song.title}`);
        } catch (e) {
            console.log(`While parsing ${songFile}, got error ${e}`);
            break;
        }
    }

    return songs;
}

const songNbrRegexp = new RegExp(`.* - JEM[^0-9]?([0-9]*)`);
const tagRegexp = new RegExp(`{(?:(.*?): )?(.*)}`);

function parseChord(bookNbr: number, bookAbb: string, lines: string[]): Song {
    const tags = new Map();
    for (const line of lines) {
        const match = line.match(tagRegexp);
        if (match === null || match.length != 3) {
            break;
        }
        tags.set(match[1], match[2]);
    }
    const [title, author, date, key] = [tags.get("t"), tags.get("st"), tags.get("c"), tags.get("key")];
    const lyrics = [];
    for (let i = 6; i < lines.length; i++) {
        const line = lines[i];
        if (line[0] == '{') {
            const tag = line.match(tagRegexp);
            switch (tag![0]) {
                case "c":
                    lyrics.push(`# ${tag![1]}`);
                    break;
                case "key":
                    i += 2;
                    continue;
            }
        } else {
            lyrics.push(line.replaceAll(/\[.*?\]/g, ''));
        }
    }
    const songNbr = parseInt(date.match(songNbrRegexp)![1]);
    return new Song(-1, { book_id: bookNbr, number: songNbr, title: title, author: author.replace(/.* - /, ''), lyrics: lyrics.join("\n") });
}