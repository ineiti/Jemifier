import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Song } from '../../lib/song';
import { ListBooks, ListServices } from '../../lib/init';

@Component({
  selector: 'app-keyword',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './keyword.component.html',
  styleUrl: './keyword.component.scss'
})
export class KeywordComponent {
  @Input() keyword = "";
  songs: Song[] = [];
  songIDs: number[] = [];
  services: string[][] = [];
  listBooks?: ListBooks;
  keywords: string[] = [];

  constructor(private data_component: DataService) { }

  async ngOnChanges() {
    const listSongs = await this.data_component.list_songs();
    this.listBooks = await this.data_component.list_books();
    const listServices = await this.data_component.list_services();
    this.keywords = await this.data_component.keywords();
    if (this.keyword !== undefined) {
      this.songIDs = [];
      this.songs = listSongs.songs
        .filter((s, i) => s.keywords.includes(this.keyword))
        .sort((a, b) => a.keywords.findIndex((k) => k === this.keyword) -
          b.keywords.findIndex((k) => k === this.keyword));
      this.songIDs = this.songs.map((s) => listSongs.find_by_number(s.book_id, s.number));
      this.services = this.songIDs
        .map((id) =>
          listServices.services
            .filter((service) => service.songs.includes(id))
            .map((service) => service.date)
        );
    }
  }
}
