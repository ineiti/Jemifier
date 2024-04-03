import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { ListSongs, SearchResult, Song } from "../../lib/song";
import { ListBooks } from '../../lib/init';
import { CommonModule } from '@angular/common';
import { SongListComponent } from '../song-list/song-list.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SongListComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  @ViewChild('search') searchElement?: ElementRef;
  songs?: ListSongs;
  books?: ListBooks;
  search_results: SearchResult[] = [];
  results: Song[] = [];
  timeouts: any[] = [];
  lyricsSize = 100;
  timeoutWait = 1;
  start: number = 0;

  constructor(private dataService: DataService) { }

  async ngOnInit() {
    document.title = "Jemifier - recherche"
    this.songs = await this.dataService.list_songs();
    this.books = await this.dataService.list_books();

    setTimeout(() => {
      if (this.searchElement !== undefined) {
        this.searchElement.nativeElement.focus();
      }
    });
  }

  getLyrics(text: string, start: number) {
    this.timeouts.push(setTimeout(() => {
      if (start > this.songs!.songs.length) {
        return;
      }
      this.search_results = this.search_results.concat(this.songs!.search_matches(text, start, start + this.lyricsSize));
      this.search_results.sort((a, b) => b.score - a.score);
      this.results = this.search_results.map((sr) => sr.song);
      this.getLyrics(text, start + this.lyricsSize);
    }, this.timeoutWait));
  }

  getValue(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
    this.timeouts.splice(0);
    this.search_results = [];
    this.results = [];
    if (text === "") {
      return;
    }
    this.start = Date.now();
    this.getLyrics(text, 0);
  }
}
