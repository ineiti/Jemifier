import { Component, Input, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

import { SongEntryComponent } from '../song-entry/song-entry.component';
import { ChosenService } from '../chosen.service';
import { Song } from '../../lib/song';
import { DataService } from '../data.service';
import { SongListComponent } from '../song-list/song-list.component';

@Component({
  selector: 'app-choose',
  standalone: true,
  imports: [CommonModule, SongListComponent, MatButtonModule, CdkDropList, CdkDrag, SongEntryComponent,
    MatFormFieldModule, MatSelectModule],
  templateUrl: './choose.component.html',
  styleUrl: './choose.component.scss'
})
export class ChooseComponent {
  @Input() songId?: string;
  propositions: Song[] = [];
  insertPos = 0;
  curChoice = "0";
  // This is used to decide if a new list should be added for new songs.
  // If the user chose a specific list, new songs will be added even to an
  // old list.
  showLatestList = true;
  readonly dialog = inject(MatDialog);

  constructor(private data: DataService, public chosen: ChosenService) {
    this.insertPos = chosen.currentList.songs.length - 1;
  }

  ngOnChanges() {
    if (this.songId !== undefined) {
      if (this.showLatestList && this.chosen.currentList.date < ChosenService.nextSunday().getTime()) {
        const d = ChosenService.nextSunday();
        this.chosen.addList(ChosenService.dateString(d), d);
        this.showLatestList = false;
      }
      this.chosen.addSong(parseInt(this.songId), this.insertPos);
      this.insertPos++;
      if (this.insertPos >= this.chosen.currentList.songs.length) {
        this.insertPos = this.chosen.currentList.songs.length - 1;
      }
    }
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

  dropSong(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.chosen.currentList.songs, event.previousIndex, event.currentIndex);
    this.update_propositions();
  }

  deleteSong(pos: number) {
    this.chosen.rmSong(pos);
  }

  updateSongProposition(pos: number) {
    this.insertPos = pos;
    this.update_propositions();
  }

  updateListChoice(index = parseInt(this.curChoice)) {
    this.curChoice = index.toString();
    this.chosen.chooseList(index);
    this.insertPos = this.chosen.currentList.songs.length - 1;
    this.showLatestList = false;
  }

  removeList() {
    this.updateListChoice(this.chosen.rmList());
  }

  async renameList() {
    const newDate = await this.showDialog("Renommer une liste", this.chosen.currentList.name, new Date(this.chosen.currentList.date));
    if (newDate !== undefined) {
      this.chosen.currentList.name = newDate.name;
      this.chosen.currentList.date = newDate.date.getTime();
      this.chosen.save();
    }
  }

  async addList() {
    const date = ChosenService.nextSunday();
    const newDate = await this.showDialog("Ajouter une nouvelle liste", ChosenService.dateString(date), date)
    if (newDate !== undefined) {
      this.updateListChoice(this.chosen.addList(newDate.name, newDate.date));
    }
  }

  shareList() {
    // TODO: implement shareList
  }

  async showDialog(title: string, name: string, date: Date): Promise<DialogData> {
    return new Promise((res) => {
      const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
        data: { title, name, date },
      });

      dialogRef.afterClosed().subscribe(res);
    });
  }
}

export interface DialogData {
  title: string;
  name: string;
  date: Date;
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'new-list.html',
  styleUrl: './choose.component.scss',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDatepickerModule,
  ],
})
export class DialogOverviewExampleDialog {
  readonly dialogRef = inject(MatDialogRef<DialogOverviewExampleDialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
