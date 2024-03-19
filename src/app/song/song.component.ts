import { Component, Input, inject } from '@angular/core';
import { DataService } from '../data.service';
import { Song } from '../../lib/song';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

  constructor(private data_component: DataService) { }

  async ngOnChanges() {
    const [bookId, songNbr] = this.songId.split("-");
    if (bookId === undefined || songNbr === undefined) {
      return;
    }

    try {
      const list_books = await this.data_component.list_books();
      const book = list_books.find_book(bookId);
      const list_songs = await this.data_component.list_songs();
      this.song = list_songs.songs[list_songs.find_by_number(book, parseInt(songNbr))];
      console.dir(this.song);
      this.book = list_books.books[this.song!.book_id].abbreviation;
      this.services = (await this.data_component.list_services()).services
        .filter((service) => {
          return service.songs.includes(this.song?.song_id ?? -1);
        })
        .map((service) => { return service.date });
      this.unknown_id = false;
    } catch {
      return;
    }
  }
}
