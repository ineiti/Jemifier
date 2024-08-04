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
  list_songs?: ListSongs;
  services?: Service[];
  servicesToShow: Service[] = [];
  progress = "";
  constructor(private data_component: DataService, private router: Router) { }

  ngOnChanges() {
    document.title = "Jemifier - dates";
    if (this.list_songs === undefined || this.services === undefined) {
      this.list_songs = this.data_component.list_songs;
      this.services = this.data_component.list_services.services.slice().reverse().slice(0);
    }

    this.addServices();
  }

  addServices() {
    this.servicesToShow = this.servicesToShow.concat(this.services!.splice(0, 10));
    this.progress += ".";
    if (this.services!.length > 0) {
      setTimeout(() => this.addServices(), 10);
    } else {
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

  trackBy(index: number, service: Service): string {
    return service.date;
  }

  async ngOnDestroy() {
    window.scrollTo(0, 0);
  }
}
