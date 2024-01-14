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
}
