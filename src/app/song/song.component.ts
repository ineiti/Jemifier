import { Component, Input, inject } from '@angular/core';
import { DataService } from '../data.service';
import { Song } from '../../lib/song';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song.component.html',
  styleUrl: './song.component.scss'
})
export class SongComponent {
  @Input() songId = "unknown";
  unknown_id = false;
  song?: Song;
  book: string = "";
  services: string[] = [];

  constructor(private data_component: DataService) { }

  async ngOnChanges() {
    console.log(`init song ${this.songId}`);
    const songIdInt = parseInt(this.songId);
    const list_songs = await this.data_component.list_songs();
    if (songIdInt < 0 || songIdInt >= list_songs.songs.length) {
      this.unknown_id = true;
    } else {
      this.song = list_songs.songs[songIdInt];
      this.book = (await this.data_component.list_books()).books[this.song!.book_id].abbreviation;
      this.services = (await this.data_component.list_services()).services
        .filter((service) => {
          return service.songs.includes(songIdInt);
        })
        .map((service) => { return service.date });
    }
  }
}
