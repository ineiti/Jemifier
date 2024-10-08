import { Component, Input, inject } from '@angular/core';
import { DataService } from '../data.service';
import { Song } from '../../lib/song';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListBooks } from '../../lib/init';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './song.component.html',
  styleUrl: './song.component.scss'
})
export class SongComponent {
  @Input() songId = "unknown";
  songIdInt = 0;
  unknown_id = true;
  song?: Song;
  book: string = "";
  services: string[] = [];
  listBooks!: ListBooks;

  constructor(private data_component: DataService) { }

  ngOnChanges() {
    const [bookId, songNbr] = this.songId.split("-");
    if (bookId === undefined || songNbr === undefined) {
      return;
    }

    try {
      this.listBooks = this.data_component.list_books;
      const book = this.listBooks.find_book(bookId);
      const list_songs = this.data_component.list_songs;
      this.song = list_songs.songs[list_songs.find_by_number(book, parseInt(songNbr))];
      this.book = this.listBooks.books[this.song!.book_id].abbreviation;
      this.services = this.data_component.list_services.get_dates(this.song!);
      this.unknown_id = false;
    } catch {
      return;
    }
  }
}
