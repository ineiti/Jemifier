import { Routes } from '@angular/router';
import { DatesComponent } from './dates/dates.component';
import { PreferredComponent } from './preferred/preferred.component';
import { SongComponent } from './song/song.component';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
    { path: '',   redirectTo: '/search', pathMatch: 'full' },
    { path: 'search', component: SearchComponent },
    { path: 'dates', component: DatesComponent },
    { path: 'preferred', component: PreferredComponent },
    { path: 'song/:songId', component: SongComponent }
];
