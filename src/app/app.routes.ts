import { Routes } from '@angular/router';
import { DatesComponent } from './dates/dates.component';
import { PreferredComponent } from './preferred/preferred.component';
import { SongComponent } from './song/song.component';
import { SearchComponent } from './search/search.component';
import { KeywordComponent } from './keyword/keyword.component';
import { AuthorComponent } from './author/author.component';
import { ChooseComponent } from './choose/choose.component';

export const routes: Routes = [
    { path: '', redirectTo: '/search', pathMatch: 'full' },
    { path: 'search', component: SearchComponent },
    { path: 'dates', component: DatesComponent },
    { path: 'dates/:date', component: DatesComponent },
    { path: 'preferred', component: PreferredComponent },
    { path: 'song/:songId', component: SongComponent },
    { path: 'keyword/:keyword', component: KeywordComponent },
    { path: 'keywords', component: KeywordComponent },
    { path: 'authors', component: AuthorComponent },
    { path: 'author/:author', component: AuthorComponent },
    { path: 'choose', component: ChooseComponent },
    { path: 'choose/:songId', component: ChooseComponent },
];
