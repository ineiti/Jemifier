import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Song } from '../../lib/song';
import { SongEntryComponent } from "../song-entry/song-entry.component";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { ListServices } from '../../lib/init';

@Component({
  selector: 'app-song-list',
  standalone: true,
  templateUrl: './song-list.component.html',
  styleUrl: './song-list.component.scss',
  imports: [CommonModule, SongEntryComponent, MatCheckboxModule, FormsModule]
})
export class SongListComponent {
  @Input() songs: Song[] = [];
  @Input() hideCheck = false;
  @Input() hideKnownCheckbox = false;
  knownOnly = false;
  services!: ListServices;

  constructor(private data: DataService){
  }

  isKnown(song: Song): boolean {
    return this.data.list_services.get_dates(song).length > 0;
  }

  some_unknown(): boolean{
    return this.songs.some((song) => this.data.list_services.get_dates(song).length === 0);
  }
}
