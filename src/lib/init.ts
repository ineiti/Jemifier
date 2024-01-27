import { Book } from "./book";
import { Song } from "./song";
import { Service } from "./service";

export class ListBooks {
    books: Book[] = [];
    static regexp = /([A-Za-z]*)(.*)/g;

    constructor(books_file: string) {
        this.books = JSON.parse(books_file).map((b: any) => new Book(b.abbreviation, b.full_name));
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

export class ListSongs {
    songs: Song[] = [];

    constructor(songs_file: string, books: ListBooks) {
        this.songs = JSON.parse(songs_file).map((line: any) => new Song(line));
    }

    find_by_number(book_id: number, number: number): number {
        const id = this.songs.findIndex((song) => (song.book_id === book_id && song.number === number));
        if (id === -1) {
            throw new Error("Couldn't find song");
        }
        return id;
    }
}

export class ListServices {
    services: Service[] = [];

    constructor(services_file: string) {
        this.services = JSON.parse(services_file).map((s: any) => new Service(s.date, s.songs));
    }
}

export class ListPreferred {
    preferred: [number, number][] = [];

    constructor(services: ListServices) {
        const count = new Map<number, number>();
        for (const service of services.services) {
            for (const song of service.songs) {
                count.set(song, (count.get(song) ?? 0) + 1);
            }
        }
        for (const [s, c] of count){
            this.preferred.push([s, c]);
        }
        this.preferred.sort((a, b) => b[1] - a[1] || a[0] - b[0])
    }
}