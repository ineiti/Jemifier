import { Component } from '@angular/core';
import { ListBooks, ListPreferred } from '../../lib/init';
import { ListSongs } from "../../lib/song";
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SongEntryComponent } from '../song-entry/song-entry.component';

@Component({
  selector: 'app-preferred',
  standalone: true,
  imports: [CommonModule, RouterLink, SongEntryComponent],
  templateUrl: './preferred.component.html',
  styleUrl: './preferred.component.scss'
})
export class PreferredComponent {
  preferred?: ListPreferred;
  songs?: ListSongs;
  books?: ListBooks;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    document.title = "Jemifier - préférées"
    this.preferred = this.dataService.preferred_songs;
    this.songs = this.dataService.list_songs;
    this.books = this.dataService.list_books;
  }
}
