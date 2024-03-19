import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { ListSongs, Song, SongSearch, SongSearchResult } from "../../lib/song";
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
  results: Song[] = [];
  timeouts: any[] = [];
  searchResult = new SongSearch();
  lyricsSize = 100;
  timeoutWait = 1;

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

  addResults(songs: Song[]) {
    this.results = this.results.concat(songs.filter((s) => !this.results.includes(s)));
  }

  getLyrics(text: string, start: number) {
    this.timeouts.push(setTimeout(() => {
      if (start > this.songs!.songs.length) {
        return;
      }
      this.searchResult.lyrics.append(this.songs!.searchLyrics(text, start, start + 200));
      this.updateResults
      this.getLyrics(text, start + this.lyricsSize);
    }, this.timeoutWait));
  }

  updateResults() {
    this.results = this.searchResult.numbers.exact;
    this.addResults(this.searchResult.keywords.exact);
    this.addResults(this.searchResult.titles.exact);
    this.addResults(this.searchResult.lyrics.exact);
    if (this.results.length === 0) {
      this.results = this.searchResult.numbers.partial;
      this.addResults(this.searchResult.keywords.partial);
      this.addResults(this.searchResult.titles.partial);
      this.addResults(this.searchResult.lyrics.partial);
    }
  }

  getValue(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
    this.timeouts.splice(0);
    if (text === ""){
      this.results = [];
      return;
    }
    
    this.searchResult = new SongSearch();
    this.searchResult.numbers = this.songs!.searchNumbers(text);
    this.updateResults();

    this.timeouts.push(setTimeout(() => {
      this.searchResult.keywords = this.songs!.searchKeywords(text);
      this.updateResults();
      this.timeouts.push(setTimeout(() => {
        this.searchResult.titles = this.songs!.searchTitles(text);
        this.updateResults();
        this.getLyrics(text, 0);
      }, this.timeoutWait));
    }, this.timeoutWait));
  }
}
