import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { ListSongs, SearchResult, Song } from "../../lib/song";
import { ListBooks } from '../../lib/init';
import { CommonModule } from '@angular/common';
import { SongListComponent } from '../song-list/song-list.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SongListComponent, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  @ViewChild('search') searchElement!: ElementRef<HTMLInputElement>;
  songs?: ListSongs;
  books?: ListBooks;
  search_results: SearchResult[] = [];
  results: Song[] = [];
  timeouts: any[] = [];
  lyricsSize = 100;
  timeoutWait = 1;
  start: number = 0;
  value = "";

  constructor(private dataService: DataService) { }

  async ngOnInit() {
    document.title = "Jemifier - recherche"
    this.songs = await this.dataService.list_songs();
    this.books = await this.dataService.list_books();

  }

  ngAfterViewInit() {
    this.searchElement.nativeElement.focus();
  }

  getLyrics(text: string, start: number) {
    this.timeouts.push(setTimeout(() => {
      if (start > this.songs!.songs.length) {
        return;
      }
      const results = this.songs!.search_matches(text, start, start + this.lyricsSize);
      this.search_results = this.search_results.concat(results);
      this.search_results.sort((a, b) => b.score - a.score);
      this.results = this.search_results.map((sr) => sr.song);
      this.getLyrics(text, start + this.lyricsSize);
    }, this.timeoutWait));
  }

  getValue() {
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
    this.timeouts.splice(0);
    this.search_results = [];
    this.results = [];
    if (this.value === "") {
      return;
    }
    this.start = Date.now();
    this.getLyrics(this.value, 0);
  }

  clear() {
    this.value = "";
    this.searchElement.nativeElement.focus();
    this.getValue();
  }
}
