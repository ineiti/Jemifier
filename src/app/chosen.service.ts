import { Injectable } from '@angular/core';
import { Song } from '../lib/song';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ChosenService {
  list: Song[] = [];

  constructor(private data: DataService) {
  }

  add_song(newId: number) {
    if (this.list.some((s) => s.song_id === newId)) {
      return;
    }
    this.list.push(this.data.list_songs.songs[newId]);
  }

  rm_song(rmId: number) {
    this.list = this.list.filter((s) => s.song_id !== rmId);
  }
}
