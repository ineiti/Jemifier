import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { ListBooks, ListServices } from '../../lib/init';
import { Song } from '../../lib/song';

@Component({
  selector: 'app-song-entry',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './song-entry.component.html',
  styleUrl: './song-entry.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SongEntryComponent {
  @Input() song!: Song;
  @Input() hideCheck = false;
  listBooks!: ListBooks;
  listServices!: ListServices;
  service_dates?: string[];
  linkYoutube = "";

  constructor(private data_component: DataService) { }

  ngOnInit() {
    this.listBooks = this.data_component.list_books;
    this.listServices = this.data_component.list_services;
    this.service_dates = this.listServices.get_dates(this.song);
    this.linkYoutube = `https://www.youtube.com/results?search_query=${this.song!.get_book_number_title(this.listBooks!)} `
      + this.song.author;
  }
}
