import { Book } from "./book";
import { Service } from "./service";
import { Song } from "./song";

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
        const id = this.books.findIndex((val) => val.abbreviation.localeCompare(abb, 'fr', { sensitivity: 'base' }) === 0);
        if (id === -1) {
            throw new Error("Didn't find this book");
        }
        return id;
    }
}

export class ListServices {
    services: Service[] = [];

    constructor(services_file: string) {
        this.services = JSON.parse(services_file).map((s: any) => new Service(s.date, s.songs));
    }

    get_dates(song: Song): string[] {
        return this.services
            .filter((service) => service.songs.includes(song!.song_id))
            .map((service) => service.date);
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
        for (const [s, c] of count) {
            this.preferred.push([s, c]);
        }
        this.preferred.sort((a, b) => b[1] - a[1] || a[0] - b[0])
    }
}