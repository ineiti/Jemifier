import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { Service } from '../../lib/service';
import { ListBooks, ListSongs } from '../../lib/init';

@Component({
  selector: 'app-dates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dates.component.html',
  styleUrl: './dates.component.scss'
})
export class DatesComponent {
  services: Service[] = [];
  list_books?: ListBooks;
  list_songs?: ListSongs;
  constructor(private data_component: DataService) { }

  async ngOnInit() {
    this.list_books = await this.data_component.list_books();
    this.list_songs = await this.data_component.list_songs();
    this.services = (await this.data_component.list_services()).services;
  }

}
