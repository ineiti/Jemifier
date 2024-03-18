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

    searchAny(text: string, conv: (s: Song) => string): SongSearchResult {
        const res = new SongSearchResult();
        for (const song of this.songs) {
            res.addMatch(song, conv(song), text);
        }
        return res;
    }

    searchNumbers(text: string): SongSearchResult {
        return this.searchAny(text, (s) => (s.number ?? 0).toString());
    }

    searchTitles(text: string): SongSearchResult {
        return this.searchAny(text, (s) => s.title);
    }

    searchLyrics(text: string): SongSearchResult {
        return this.searchAny(text, (s) => s.lyrics);
    }

    searchKeywords(text: string): SongSearchResult {
        return this.searchAny(text, (s) => (s.keywords ?? []).join(" "));
    }

    search(text: string): SongSearch {
        return {
            numbers: this.searchNumbers(text),
            titles: this.searchTitles(text),
            lyrics: this.searchLyrics(text),
            keywords: this.searchKeywords(text),
        }
    }
}

class SongSearchResult {
    exact: Song[] = [];
    partial: Song[] = [];

    partialMatch(base: string, search: string): boolean {
        if (base.length < search.length) {
            return false;
        }
        for (let i = 0; i < search.length; i++) {
            if (base[i].localeCompare(search[i], 'fr', { sensitivity: 'base' }) !== 0) {
                return false
            }
        }
        return true;
    }

    addMatch(song: Song, source: string, search: string) {
        if (source.localeCompare(search, 'fr', { sensitivity: 'base' }) === 0) {
            this.exact.push(song);
            return;
        }
        if (search.includes(" ")) {
            if (this.partialMatch(source, search)) {
                this.partial.push(song);
                return;
            }
        }

        let partial = false;
        for (const word of source.split(" ")) {
            if (word.localeCompare(search, 'fr', { sensitivity: 'base' }) === 0) {
                this.exact.push(song);
                return;
            } else if (this.partialMatch(word, search)) {
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
