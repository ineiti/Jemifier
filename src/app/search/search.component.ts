import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { ListSongs, Song } from "../../lib/song";
import { ListBooks } from '../../lib/init';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  @ViewChild('search') searchElement?: ElementRef;
  songs?: ListSongs;
  books?: ListBooks;
  results: Song[] = [];

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

  getValue(event: Event) {
    const text = (event.target as HTMLInputElement).value;

    const results = this.songs!.search(text);
    this.results = [
      ...results.numbers.exact,
      ...results.titles.exact,
      ...results.lyrics.exact,
      ...results.keywords.exact
    ];
  }
}
