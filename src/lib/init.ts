import { parse } from "csv-parse/sync";

import { Book } from "./book";
import { Song } from "./song";
import { Service } from "./service";

export class ListBooks {
    books: Book[] = [];
    static regexp = /([A-Za-z]*)(.*)/g;

    constructor(books_file: string) {
        this.books = parse(books_file, {
            delimiter: ",",
            columns: ["abbreviation", "full_name"],
        });
    }

    get_book_abb(abb_str: string): [number, number] {
        const index_split = [...abb_str.matchAll(ListBooks.regexp)];
        if (index_split.length === 0) {
            throw (new Error(`Didn't find result in {res.index}`));
        }
        if (index_split[0].length != 3) {
            throw new Error(`Couldn't split index {res.index}`);
        }
        const [abb, num] = [index_split[0][1], parseInt(index_split[0][2])];
        const book_id = this.find_book(abb);
        return [book_id, num];
    }

    find_book(abb: string): number {
        const id = this.books.findIndex((val) => val.abbreviation === abb);
        if (id === -1) {
            throw new Error("Didn't find this book");
        }
        return id;
    }
}

type SongRaw = {
    index: string,
    name: string,
}

export class ListSongs {
    songs: Song[] = [];

    constructor(songs_file: string, books: ListBooks) {
        const result: SongRaw[] = parse(songs_file, {
            delimiter: ",",
            columns: ["index", "name"]
        });
        this.songs = result.map(res => {
            const [book_id, num] = books.get_book_abb(res.index);
            return new Song(book_id, num, res.name, "");
        });
    }

    find_by_number(book_id: number, number: number): number {
        const id = this.songs.findIndex((song) => (song.book_id === book_id && song.number === number));
        if (id === -1) {
            throw new Error("Couldn't find song");
        }
        return id;
    }
}

type ServiceRaw = {
    date: string,
    songs: string[]
}

export class ListServices {
    services: Service[] = [];

    constructor(services_file: string, books: ListBooks, songs: ListSongs) {
        const result: ServiceRaw[] = parse(services_file, {
            delimiter: ",",
            columns: ["date", "songs"],
            group_columns_by_name: true,
        });
        this.services = result.map(res => {
            const song_ids = res.songs.split("|").map(song => {
                const [book_id, num] = books.get_book_abb(song);
                return songs.find_by_number(book_id, num);
            });
            return new Service(res.date, song_ids);
        })
    }
}