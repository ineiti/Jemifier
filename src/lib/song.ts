import { ListBooks } from "./init";

export class Song {
    book_id: number;
    number: number;
    title: string;
    lyrics: string;

    constructor(book_id: number, number: number, title: string, lyrics: string) {
        this.book_id = book_id;
        this.number = number;
        this.title = title;
        this.lyrics = lyrics;
    }

    get_book_number(books: ListBooks): string {
        return `${books.books[this.book_id].abbreviation} ${this.number}`;
    }

    get_book_number_title(books: ListBooks): string {
        return `${this.get_book_number(books)} - ${this.title}`;
    }
}
