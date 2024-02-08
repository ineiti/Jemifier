import { ListSongs } from "./song";
import { Song } from "./song";

export class Service {
    constructor(public date: string, public songs: number[]) { }

    get_songs(songs: ListSongs): Song[] {
        return this.songs.map((song_id) => songs.songs[song_id]);
    }
}