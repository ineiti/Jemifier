import { ListBooks } from "./init";

export class Song {
    book_id: number;
    number: number;
    title: string;
    lyrics: string;
    keywords: string[] = [];
    constructor(line: any) {
        this.book_id = line.book_id;
        this.number = line.number;
        this.title = line.title;
        this.lyrics = line.lyrics.trim();
        this.keywords = line.keywords;
    }

    get_book_number(books: ListBooks): string {
        return `${books.books[this.book_id].abbreviation} ${this.number}`;
    }

    get_book_number_title(books: ListBooks): string {
        return `${this.get_book_number(books)} - ${this.title}`;
    }
}
