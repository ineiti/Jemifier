import { Injectable } from '@angular/core';
import { ListSongs, Song } from '../lib/song';
import { DataService } from './data.service';

interface StorageSongListJSON {
  name: string;
  // for which service the list is supposed to be - indicates when
  // a new list needs to be created.
  date: number;
  // This is matched against Song.get_book_number, which must return a 
  // unique match.
  song_book_numbers: string[];
}

// stores the lists in one JSON object - this is probably OK for most use-cases,
// as I think it can easily handle 1000s of lists w/o too much worries.
interface StorageListJSON {
  // ordered inversely by StorageSongList.date, from most recent to oldest.
  lists: StorageSongListJSON[];
}

export interface StorageSongList {
  name: string;
  date: number;
  songs: Song[];
}

@Injectable({
  providedIn: 'root'
})
export class ChosenService {
  static STORAGE_LIST = "ChosenServiceList";
  list: StorageSongList[] = [];
  currentList!: StorageSongList;

  constructor(private data: DataService) {
  }

  async initLists() {
    try {
      const storageListJSON = localStorage.getItem(ChosenService.STORAGE_LIST);
      if (storageListJSON !== null) {
        const storageList: StorageListJSON = JSON.parse(storageListJSON);
        for (const list of storageList.lists) {
          this.list.push({
            name: list.name,
            date: list.date,
            songs: list.song_book_numbers.map((s) => this._getSong(s)).filter((s) => s !== undefined) as Song[],
          })
        }
      }
      this.list.sort((a, b) => b.date - a.date);
      const nextSunday = new Date();
      const daysToAdd = (7 - nextSunday.getDay()) % 7;
      nextSunday.setDate(nextSunday.getDate() + daysToAdd);
      if (this.list.length === 0 || this.list[this.list.length - 1].date < nextSunday.getDate()) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const name = nextSunday.toLocaleDateString(navigator.language, options as Intl.DateTimeFormatOptions);
        this.list.push({ name, date: nextSunday.getDate(), songs: [] });
      }
      this.currentList = this.list[this.list.length - 1];
    } catch (e) {
      console.error(`Oups, couldn't parse data in localStorage (${e}) - deleting it`);
      localStorage.removeItem(ChosenService.STORAGE_LIST);
      await this.initLists();
    }
  }

  private _getSong(songStr: string): Song | undefined {
    return this.data.list_songs.songs.find((s) => s.get_book_number(this.data.list_books) === songStr);
  }

  addSong(newId: number, pos: number | undefined) {
    if (this.currentList.songs.some((s) => s.song_id === newId)) {
      return;
    }
    this.currentList.songs.splice((pos ?? this.currentList.songs.length - 1) + 1, 0, this.data.list_songs.songs[newId]);
    this.save();
  }

  rmSong(pos: number) {
    if (pos >= 0 && pos < this.currentList.songs.length) {
      this.currentList.songs.splice(pos, 1);
    }
    this.save();
  }

  save() {
    const json = this.list.map((l) => {
      return {
        name: l.name,
        date: l.date,
        song_book_numbers: l.songs.map((s) => s.get_book_number(this.data.list_books))
      }
    });
    localStorage.setItem(ChosenService.STORAGE_LIST, JSON.stringify({ lists: json }));
  }
}
