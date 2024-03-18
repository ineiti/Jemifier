import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { ListSongs, Song } from "../../lib/song";
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

  constructor(private dataService: DataService) { }

  async ngOnInit() {
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

  getValue(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
    this.timeouts.splice(0);
    const numbers = this.songs!.searchNumbers(text);
    this.results = numbers.exact;
    if (text === "") {
      return;
    }

    this.timeouts.push(setTimeout(() => {
      const keywords = this.songs!.searchKeywords(text);
      this.addResults(keywords.exact);
      this.timeouts.push(setTimeout(() => {
        const titles = this.songs!.searchTitles(text);
        this.addResults(titles.exact);
        this.timeouts.push(setTimeout(() => {
          const lyrics = this.songs!.searchLyrics(text);
          this.addResults(lyrics.exact);
          console.log(`results: ${this.results.length}`);
          if (this.results.length === 0) {
            this.results = numbers.partial;
            this.addResults(keywords.partial);
            this.addResults(titles.partial);
            this.addResults(lyrics.partial);
          }
        }, 1));
      }, 1));
    }, 1));
  }
}
