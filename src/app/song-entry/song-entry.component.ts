import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../data.service';
import { ListBooks, ListServices } from '../../lib/init';
import { Song } from '../../lib/song';
import { Service } from '../../lib/service';

@Component({
  selector: 'app-song-entry',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './song-entry.component.html',
  styleUrl: './song-entry.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SongEntryComponent {
  listBooks!: ListBooks;
  listServices!: ListServices;
  @Input() song!: Song;
  services?: string[];

  constructor(private data_component: DataService) { }

  async ngOnInit() {
    this.listBooks = await this.data_component.list_books();
    this.listServices = await this.data_component.list_services();
    this.services = this.listServices
      .services
      .filter((service) => service.songs.includes(this.song!.song_id))
      .map((service) => service.date);
  }
}
