import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Song } from '../../lib/song';
import { SongEntryComponent } from "../song-entry/song-entry.component";
import { SongListComponent } from "../song-list/song-list.component";

@Component({
  selector: 'app-keyword',
  standalone: true,
  templateUrl: './keyword.component.html',
  styleUrl: './keyword.component.scss',
  imports: [CommonModule, RouterLink, SongEntryComponent, SongListComponent]
})
export class KeywordComponent {
  @Input() keyword = "";
  songs: Song[] = [];
  keywords: string[] = [];

  constructor(private data_component: DataService) { }

  ngOnChanges() {
    document.title = "Jemifier - mots clés";
    const listSongs = this.data_component.list_songs;
    this.keywords = this.data_component.keywords.list.map((k) => k.replace('-', '&#8209;'));
    this.keywords.sort((a, b) => a.localeCompare(b));
    if (this.keyword !== undefined) {
      this.songs = listSongs.songs
        .filter((s, i) => s.keywords.includes(this.keyword))
        .sort((a, b) => a.keywords.findIndex((k) => k === this.keyword) -
          b.keywords.findIndex((k) => k === this.keyword));
    }
  }
}
