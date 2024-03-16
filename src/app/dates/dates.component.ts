import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { Service } from '../../lib/service';
import { ListBooks, ListServices } from '../../lib/init';
import { ListSongs } from "../../lib/song";
import { Router, RouterLink } from '@angular/router';
import { SongListComponent } from "../song-list/song-list.component";

@Component({
    selector: 'app-dates',
    standalone: true,
    templateUrl: './dates.component.html',
    styleUrl: './dates.component.scss',
    imports: [CommonModule, RouterLink, SongListComponent]
})
export class DatesComponent {
  list_services?: ListServices;
  list_books?: ListBooks;
  list_songs?: ListSongs;
  constructor(private data_component: DataService, private router: Router) { }

  async ngOnInit() {
    this.list_books = await this.data_component.list_books();
    this.list_songs = await this.data_component.list_songs();
    this.list_services = await this.data_component.list_services();

    const hash = window.location.hash;
    if (hash !== null) {
      setTimeout(() => {
        const targetElement = document.getElementById(hash.slice(1));
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }
}
