import { ListSongs } from "./init";
import { Song } from "./song";

export class Service {
    date: string;
    songs: number[];

    constructor(date: string, songs: number[]) {
        this.date = date;
        this.songs = songs;
    }

    get_songs(songs: ListSongs): Song[] {
        return this.songs.map((song_id) => songs.songs[song_id]);
    }
}