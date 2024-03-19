import { Component, Input } from '@angular/core';
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
  @Input() date?: string;
  list_services?: ListServices;
  list_songs?: ListSongs;
  constructor(private data_component: DataService, private router: Router) { }

  async ngOnChanges(){
    this.list_songs = await this.data_component.list_songs();
    this.list_services = await this.data_component.list_services();

    document.title = "Jemifier - dates";
    if (this.date !== undefined) {
      document.title = `Jemifier - ${this.date}`;
      setTimeout(() => {
        const targetElement = document.getElementById(this.date!);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }
}
