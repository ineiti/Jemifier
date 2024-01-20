import { ListSongs } from "./init";
import { Song } from "./song";

export class Service {
    date: string;

    constructor(date: string, public songs: number[]) {
        this.date = `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6, 8)}`;
    }

    get_songs(songs: ListSongs): Song[] {
        return this.songs.map((song_id) => songs.songs[song_id]);
    }
}