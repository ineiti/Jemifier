import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SongListComponent } from '../song-list/song-list.component';
import { Song } from '../../lib/song';
import { DataService } from '../data.service';

@Component({
  selector: 'app-author',
  standalone: true,
  imports: [CommonModule, RouterLink, SongListComponent],
  templateUrl: './author.component.html',
  styleUrl: './author.component.scss'
})
export class AuthorComponent {
  @Input() author?: string;
  authors: string[] = [];
  songs: Song[] = [];

  constructor(private dataComponent: DataService) { }

  ngOnChanges() {
    document.title = "Jemifier - auteurs";
    const listSongs = this.dataComponent.list_songs;
    this.authors = [...new Set(listSongs.songs.flatMap((s) => s.authors()))];
    this.authors.sort((a, b) => a.localeCompare(b));
    if (this.author !== undefined) {
      this.songs = listSongs.songs
        .filter((s, i) => s.author.includes(this.author!));
    }
  }
}
