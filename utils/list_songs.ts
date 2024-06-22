import * as fs from 'fs';
import { command, run } from 'cmd-ts';
import { ListBooks } from '../src/lib/init';
import { ListSongs } from "../src/lib/song";

const app = command({
    name: 'list_songs',
    args: {
    },
    handler: () => {
        convertSong();
    },
});

run(app, process.argv.slice(2));

async function convertSong() {
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
    for (const song of listSongs.songs) {
        console.log(`${song.get_book_number_title(listBooks)}`);
    }
}