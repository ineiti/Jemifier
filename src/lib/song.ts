import { ListBooks } from "./init";
import { Keywords } from "./keywords";

export enum FOUND {
    NUMBER = 4,
    TITLE = 3,
    KEYWORDS = 2,
    LYRICS = 1,
};

export class Song {
    book_id: number;
    number: number;
    title: string;
    title_search: SearchString;
    lyrics: string;
    lyrics_search: SearchString;
    keywords: string[] = [];
    keywords_search: SearchString[] = [];

    constructor(public song_id: number, line: any) {
        this.book_id = line.book_id;
        this.number = line.number;
        this.title = line.title;
        this.title_search = new SearchString(this.title);
        this.lyrics = line.lyrics.trim();
        this.lyrics_search = new SearchString(this.lyrics);
    }

    set_keywords(kws: string[]) {
        this.keywords = kws;
        this.keywords_search = kws.map((kw) => new SearchString(kw));
    }

    search_score(search: string): number {
        const nbr = parseInt(search);
        if (!Number.isNaN(nbr)) {
            if (this.number === nbr) {
                return FOUND.NUMBER;
            }
        }
        const title = this.title_search.search(search, FOUND.TITLE);
        if (title > 0) {
            return title;
        }
        const keywords = this.keywords_search
            .map((kw, i) => kw.search(search, FOUND.KEYWORDS + (4-i) * 0.2))
            .filter((res) => res > 0);
        if (keywords.length > 0) {
            keywords.sort();
            return keywords.pop()!;
        }
        return this.lyrics_search.search(search, FOUND.LYRICS);
    }

    get_book_number(books: ListBooks, separator = " "): string {
        return `${books.books[this.book_id].abbreviation}${separator}${this.number}`;
    }

    get_book_number_title(books: ListBooks): string {
        return `${this.get_book_number(books)} - ${this.title}`;
    }
}

class SearchString {
    lower_ascii: string;
    parts: string[];

    constructor(orig: string) {
        this.lower_ascii = orig.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        this.parts = this.lower_ascii.split(/[,\.' -]/).filter((p) => p.length > 0);
    }

    search(search: string, weight: number): number {
        if (this.parts.some((s) => s === search)) {
            return weight;
        }
        if (this.parts.some((s) => s.startsWith(search))) {
            return weight - 0.5;
        }
        return 0;
    }
}

export class ListSongs {
    songs: Song[] = [];

    // CLEANUP: remove books
    constructor(songs_file: string, books: ListBooks) {
        this.songs = JSON.parse(songs_file).map((line: any, i: number) => new Song(i, line));
    }

    add_keywords(keywords: Keywords) {
        for (const entry of keywords.songs) {
            try {
                const index = this.find_by_number(entry.book_id, entry.number);
                this.songs[index].set_keywords(entry.keywords);
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

    search_matches(search: string, start: number, end: number): SearchResult[] {
        if (start > this.songs.length) {
            return [];
        }
        if (end > this.songs.length) {
            end = this.songs.length;
        }
        const search_str = new SearchString(search);
        let results: SearchResult[] = [];
        for (const s_str of search_str.parts) {
            results = results.concat(results, this.songs
                .slice(start, end)
                .map((song) => new SearchResult(song, song.search_score(s_str)))
                .filter((sr) => sr.score > 0));
        }
        if (results.length > 1) {
            const result: SearchResult[] = [];
            results
                .sort((a, b) => a.song.song_id - b.song.song_id)
                .reduce((prev, curr) => {
                    if (prev.song.song_id !== curr.song.song_id) {
                        result.push(prev);
                        return curr;
                    }
                    curr.score += prev.score;
                    return curr;
                });
            return result;
        } else {
            return results;
        }
    }
}

export class SearchResult {
    constructor(public song: Song, public score: number) { }
}