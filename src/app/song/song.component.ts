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
  unknown_id = false;
  song?: Song;
  book: string = "";
  services: string[] = [];

  constructor(private data_component: DataService) { }

  async ngOnChanges() {
    this.songIdInt = parseInt(this.songId);
    const list_songs = await this.data_component.list_songs();
    if (this.songIdInt < 0 || this.songIdInt >= list_songs.songs.length) {
      this.unknown_id = true;
    } else {
      this.song = list_songs.songs[this.songIdInt];
      this.book = (await this.data_component.list_books()).books[this.song!.book_id].abbreviation;
      this.services = (await this.data_component.list_services()).services
        .filter((service) => {
          return service.songs.includes(this.songIdInt);
        })
        .map((service) => { return service.date });
    }
  }
}
