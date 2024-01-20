import { Injectable } from '@angular/core';
import { ListBooks, ListServices, ListSongs } from '../lib/init';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _list_books?: ListBooks;
  private _list_songs?: ListSongs;
  private _list_services?: ListServices;

  async list_books(): Promise<ListBooks> {
    if (this._list_books === undefined) {
      const books_file = await fetch("./assets/books.json");
      this._list_books = new ListBooks(await books_file.text());
    }
    return this._list_books;
  }

  async list_songs(): Promise<ListSongs> {
    if (this._list_songs === undefined) {
      const songs_file = await fetch("./assets/songs.json");
      this._list_songs = new ListSongs(await songs_file.text(), await this.list_books());
    }
    return this._list_songs;
  }

  async list_services(): Promise<ListServices> {
    if (this._list_services === undefined) {
      const services_file = await fetch("./assets/services.json");
      this._list_services = new ListServices(await services_file.text());
    }
    return this._list_services;
  }
}
