import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { Service } from '../../lib/service';
import { ListBooks, ListSongs } from '../../lib/init';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dates.component.html',
  styleUrl: './dates.component.scss'
})
export class DatesComponent {
  services: Service[] = [];
  list_books?: ListBooks;
  list_songs?: ListSongs;
  constructor(private data_component: DataService, private router: Router) { }

  async ngOnInit() {
    this.list_books = await this.data_component.list_books();
    this.list_songs = await this.data_component.list_songs();
    this.services = (await this.data_component.list_services()).services;

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
