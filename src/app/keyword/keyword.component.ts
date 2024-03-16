import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Song } from '../../lib/song';
import { ListBooks, ListServices } from '../../lib/init';
import { SongEntryComponent } from "../song-entry/song-entry.component";

@Component({
    selector: 'app-keyword',
    standalone: true,
    templateUrl: './keyword.component.html',
    styleUrl: './keyword.component.scss',
    imports: [CommonModule, RouterLink, SongEntryComponent]
})
export class KeywordComponent {
  @Input() keyword = "";
  songs: Song[] = [];
  keywords: string[] = [];

  constructor(private data_component: DataService) { }

  async ngOnChanges() {
    const listSongs = await this.data_component.list_songs();
    this.keywords = (await this.data_component.keywords()).list;
    if (this.keyword !== undefined) {
      this.songs = listSongs.songs
        .filter((s, i) => s.keywords.includes(this.keyword))
        .sort((a, b) => a.keywords.findIndex((k) => k === this.keyword) -
          b.keywords.findIndex((k) => k === this.keyword));
    }
  }
}
