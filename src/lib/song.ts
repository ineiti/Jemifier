import { ListBooks } from "./init";

export class Song {
    lyrics: string;

    constructor(public book_id: number, public number: number, public title: string, lyrics: string) {
        this.lyrics = lyrics.trim();
    }

    get_book_number(books: ListBooks): string {
        return `${books.books[this.book_id].abbreviation} ${this.number}`;
    }

    get_book_number_title(books: ListBooks): string {
        return `${this.get_book_number(books)} - ${this.title}`;
    }
}
