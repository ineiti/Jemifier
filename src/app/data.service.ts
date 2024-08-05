import { Injectable } from '@angular/core';
import { ListBooks, ListPreferred, ListServices } from '../lib/init';
import { ListSongs } from "../lib/song";
import { Keywords } from '../lib/keywords';
import { Suggestion } from './suggestion';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  list_books!: ListBooks;
  list_songs!: ListSongs;
  list_services!: ListServices;
  preferred_songs!: ListPreferred;
  keywords!: Keywords;
  suggestions!: Suggestion;

  async load_all(){
    await this.get_keywords();
    await this.get_list_books();
    await this.get_list_songs();
    await this.get_list_services();
    await this.get_preferred_songs();
    await this.get_suggestions();
  }

  private async get_list_books(): Promise<ListBooks> {
    if (this.list_books === undefined) {
      const books_file = await fetch("./assets/books.json");
      this.list_books = new ListBooks(await books_file.text());
    }
    return this.list_books;
  }

  private async get_list_songs(): Promise<ListSongs> {
    if (this.list_songs === undefined) {
      const songs_file = await fetch("./assets/songs.json");
      this.list_songs = new ListSongs(await songs_file.text());

      const keywords_file = await fetch("./assets/keywords.json");
      this.list_songs!.add_keywords(this.keywords);
    }
    return this.list_songs;
  }

  private async get_list_services(): Promise<ListServices> {
    if (this.list_services === undefined) {
      const services_file = await fetch("./assets/services.json");
      this.list_services = new ListServices(await services_file.text());
    }
    return this.list_services;
  }

  private async get_preferred_songs(): Promise<ListPreferred> {
    if (this.preferred_songs === undefined) {
      this.preferred_songs = new ListPreferred(this.list_services);
    }
    return this.preferred_songs;
  }

  private async get_keywords(): Promise<Keywords> {
    if (this.keywords === undefined) {
      const keywords_file = await fetch("./assets/keywords.json");
      this.keywords = new Keywords(await keywords_file.text());
    }
    return this.keywords!;
  }

  private get_suggestions() {
    this.suggestions = Suggestion.createSuggestions(this.list_services.services);
  }
}
