import { ListBooks } from "./init";
import { Keywords } from "./keywords";

export class Song {
    book_id: number;
    number: number;
    title: string;
    lyrics: string;
    keywords: string[] = [];
    constructor(public song_id: number, line: any) {
        this.book_id = line.book_id;
        this.number = line.number;
        this.title = line.title;
        this.lyrics = line.lyrics.trim();
    }

    get_book_number(books: ListBooks): string {
        return `${books.books[this.book_id].abbreviation} ${this.number}`;
    }

    get_book_number_title(books: ListBooks): string {
        return `${this.get_book_number(books)} - ${this.title}`;
    }
}

export class ListSongs {
    songs: Song[] = [];

    constructor(songs_file: string, books: ListBooks) {
        this.songs = JSON.parse(songs_file).map((line: any, i: number) => new Song(i, line));
    }

    add_keywords(keywords: Keywords) {
        for (const entry of keywords.songs) {
            try {
                const index = this.find_by_number(entry.book_id, entry.number);
                this.songs[index].keywords = entry.keywords;
            } catch (e) {
                console.warn(`While reading keywords, couldn't find ${entry}`);
            }
        }
    }

    find_by_number(book_id: number, number: number): number {
        const id = this.songs.findIndex((song) => (song.book_id === book_id && song.number === number));
        if (id === -1) {
            throw new Error("Couldn't find song");
        }
        return id;
    }

    search(text: string): SongSearch {
        const ss: SongSearch = {
            numbers: new SongSearchResult(),
            titles: new SongSearchResult(),
            lyrics: new SongSearchResult(),
            keywords: new SongSearchResult(),
        };
        for (const song of this.songs) {
            if (song.number === null) {
                console.dir(song);
                continue;
            }
            ss.numbers.addMatch(song, song.number.toString(), text);
            ss.titles.addMatch(song, song.title, text);
            ss.lyrics.addMatch(song, song.lyrics, text);
            ss.keywords.addMatch(song, (song.keywords ?? []).join(" "), text);
        }
        return ss;
    }
}

class SongSearchResult {
    exact: Song[] = [];
    partial: Song[] = [];

    addMatch(song: Song, source: string, search: string) {
        if (source.localeCompare(search, 'fr', { sensitivity: 'base' }) === 0) {
            return;
        }

        let partial = false;
        for (const word of source.split(" ")) {
            if (word.localeCompare(search, 'fr', { sensitivity: 'base' }) === 0) {
                if (word.length === search.length) {
                    this.exact.push(song);
                    return;
                }
                partial = true;
            }
        }
        if (partial) {
            this.partial.push(song);
        }
    }
}

interface SongSearch {
    numbers: SongSearchResult,
    titles: SongSearchResult,
    lyrics: SongSearchResult,
    keywords: SongSearchResult,
}
