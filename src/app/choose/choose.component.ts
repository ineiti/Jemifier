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
  insertPos = 0;

  constructor(private data: DataService, public chosen: ChosenService) {
    this.insertPos = chosen.currentList.songs.length - 1;
  }

  ngOnChanges() {
    if (this.songId !== undefined) {
      this.chosen.addSong(parseInt(this.songId), this.insertPos);
      this.insertPos++;
      if (this.insertPos >= this.chosen.currentList.songs.length) {
        this.insertPos = this.chosen.currentList.songs.length - 1;
      }
    }
    this.update_propositions();
  }

  clear() {
    this.chosen.currentList.songs.splice(0);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.chosen.currentList.songs, event.previousIndex, event.currentIndex);
    this.update_propositions();
  }

  update_propositions() {
    if (this.chosen.currentList.songs.length === 0) {
      return;
    }
    const last = this.chosen.currentList.songs.slice(this.insertPos)[0];
    const known = this.data.suggestions
      .getSuggestionsAll(this.chosen.currentList.songs.slice(0, this.insertPos + 1).map((s) => s.song_id))
      .map((s) => this.data.list_songs.songs[s]);
    let keywords = this.data.list_songs.songs
      .filter((s) => last.keywords.length === 0 || s.keywords.includes(last.keywords[0]))
      .sort((a, b) => a.keywords.findIndex((k) => k === last.keywords[0]) -
        b.keywords.findIndex((k) => k === last.keywords[0]));
    const twoFilter = keywords.filter((s) => last.keywords.length <= 1 || s.keywords.includes(last.keywords[1]));
    if (twoFilter.length > 1) {
      keywords = twoFilter;
    }

    this.propositions = known.concat(keywords)
      .filter((s) => !this.chosen.currentList.songs.some((l) => l.song_id === s.song_id));
  }

  delete(pos: number) {
    this.chosen.rmSong(pos);
  }

  insert(pos: number) {
    this.insertPos = pos;
    this.update_propositions();
  }
}
