import { Component, Input } from '@angular/core';
import { Song } from '../../lib/song';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { SongListComponent } from '../song-list/song-list.component';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-choose',
  standalone: true,
  imports: [CommonModule, SongListComponent, MatButtonModule],
  templateUrl: './choose.component.html',
  styleUrl: './choose.component.scss'
})
export class ChooseComponent {
  @Input() songId?: number;
  list: Song[] = [];

  constructor(private data: DataService){}

  ngOnInit(){
    if (this.songId !== undefined){
      this.list = [this.data.list_songs.songs[this.songId]];
    }
  }
}
