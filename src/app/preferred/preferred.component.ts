import { Component } from '@angular/core';
import { ListBooks, ListPreferred } from '../../lib/init';
import { ListSongs } from "../../lib/song";
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-preferred',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './preferred.component.html',
  styleUrl: './preferred.component.scss'
})
export class PreferredComponent {
  preferred?: ListPreferred;
  songs?: ListSongs;
  books?: ListBooks;

  constructor(private dataService: DataService) { }

  async ngOnInit() {
    this.preferred = await this.dataService.list_preferred();
    this.songs = await this.dataService.list_songs();
    this.books = await this.dataService.list_books();
  }
}
