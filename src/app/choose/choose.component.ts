import { Component, Input } from '@angular/core';
import { Song } from '../../lib/song';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { SongListComponent } from '../song-list/song-list.component';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { SongEntryComponent } from '../song-entry/song-entry.component';
import { ChosenService } from '../chosen.service';

@Component({
  selector: 'app-choose',
  standalone: true,
  imports: [CommonModule, SongListComponent, MatButtonModule, CdkDropList, CdkDrag, SongEntryComponent],
  templateUrl: './choose.component.html',
  styleUrl: './choose.component.scss'
})
export class ChooseComponent {
  @Input() songId?: string;
  propositions: Song[] = [];

  constructor(private data: DataService, public chosen: ChosenService) {
  }

  ngOnChanges() {
    if (this.songId !== undefined) {
      this.chosen.add_song(parseInt(this.songId));
    }
    this.update_propositions();
  }

  clear() {
    this.chosen.list.splice(0);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.chosen.list, event.previousIndex, event.currentIndex);
    this.update_propositions();
  }

  update_propositions() {
    if (this.chosen.list.length === 0) {
      return;
    }
    const last = this.chosen.list.slice(-1)[0];
    this.propositions = this.data.list_songs.songs
      .filter((s) => last.keywords.length === 0 || s.keywords.includes(last.keywords[0]))
      .filter((s) => !this.chosen.list.some((l) => l.song_id === s.song_id))
      .sort((a, b) => a.keywords.findIndex((k) => k === last.keywords[0]) -
        b.keywords.findIndex((k) => k === last.keywords[0]));
    const twoFilter = this.propositions.filter((s) => last.keywords.length <= 1 || s.keywords.includes(last.keywords[1]));
    if (twoFilter.length > 1) {
      this.propositions = twoFilter;
    }
  }

  delete(id: number) {
    this.chosen.rm_song(id);
  }
}
