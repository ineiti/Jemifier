import { ListSongs } from "./song";

interface KeywordsSong {
    book_id: number,
    number: number,
    keywords: string[],
}

interface KeywordsFile {
    list: string[],
    keywords: {
        book_id: number,
        number: number,
        keywords: number[],
    }[]
}

export class Keywords {
    list: string[] = [];
    songs: KeywordsSong[] = [];

    constructor(file: string) {
        const content: KeywordsFile = JSON.parse(file);
        this.list = content.list;
        for (const keyword of content.keywords) {
            this.songs.push({
                book_id: keyword.book_id,
                number: keyword.number,
                keywords: keyword.keywords.map((kw) => content.list[kw]),
            });
        }
    }

    toString(): string {
        const out: KeywordsFile = {
            list: this.list,
            keywords: this.songs.map((s) => {
                return {
                    book_id: s.book_id,
                    number: s.number,
                    keywords: s.keywords.map((kw) => this.list.findIndex((l) => l === kw)),
                };
            })
        };
        return JSON.stringify(out);
    }
}