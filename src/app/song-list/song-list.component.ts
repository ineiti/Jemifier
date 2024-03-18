import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Song } from '../../lib/song';
import { SongEntryComponent } from "../song-entry/song-entry.component";
import { ListBooks, ListServices } from '../../lib/init';

@Component({
    selector: 'app-song-list',
    standalone: true,
    templateUrl: './song-list.component.html',
    styleUrl: './song-list.component.scss',
    imports: [CommonModule, SongEntryComponent]
})
export class SongListComponent {
  @Input() songs: Song[] = [];
}
