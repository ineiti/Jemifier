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
  static msecDay = 24 * 60 * 60 * 1000;

  list: StorageSongList[] = [];
  currentList!: StorageSongList;

  constructor(private data: DataService) {
  }

  static nextSunday(now = new Date().getTime()): Date {
    now -= now % ChosenService.msecDay;
    // Calculate the number of days to add to get to the next Sunday.
    // If today is Sunday, we want to add 7 days.
    const daysToAdd = (7 - new Date(now).getDay());
    return new Date(now + daysToAdd * ChosenService.msecDay);
  }

  static dateString(d: Date): string {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString(navigator.language, options as Intl.DateTimeFormatOptions);
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
      const nextSunday = ChosenService.nextSunday();
      if (this.list.length === 0) {
        this.list.push({ name: ChosenService.dateString(nextSunday), date: nextSunday.getTime(), songs: [] });
      }
      this.currentList = this.list[0];
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

  chooseList(index: number): boolean {
    if (index < 0 || index >= this.list.length) {
      return false;
    }
    this.currentList = this.list[index];
    return true;
  }

  addList(name: string, date: Date): number {
    const list = { name, date: date.getTime(), songs: [] }
    this.list.push(list);
    this.list.sort((a, b) => b.date - a.date);
    const index = this.list.findIndex((l) => l === list);
    this.chooseList(index);
    this.save();
    return index;
  }

  rmList(index = this.list.findIndex((l) => l === this.currentList)): number {
    if (index < 0 || index >= this.list.length) {
      return -1;
    }
    this.list.splice(index, 1);
    // Try to set the new list as the next element, or else choose the first element,
    // or finally create a new list.
    if (!this.chooseList(index)) {
      if (!this.chooseList(0)) {
        const d = ChosenService.nextSunday();
        this.addList(ChosenService.dateString(d), d);
      }
    }
    this.save();
    return this.list.findIndex((l) => l === this.currentList);
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
