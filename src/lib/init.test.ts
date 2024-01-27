import { parse } from "papaparse";
import { ListBooks, ListServices, ListSongs } from "./init";
import { Song } from "./song";
import { Book } from "./book";

const booksTest =
    `[{"abbreviation":"JEM","full_name":"J'aime l'Éternel"},
    {"abbreviation":"JemKids","full_name":"J'aime l'Éternel Kids"}]`;

const songsTest =
    `[{"book_id":0,"number":1,"title":"J'aime l'Eternel","lyrics":"J'aime l'Éternel car Il entend ma voix"},
    {"book_id":0,"number":2,"title":"Quand je vois le ciel","lyrics":"Quand je vois le ciel, œuvre de tes doigts"},
    {"book_id":0,"number":4,"title":"Éternel! Fais-moi connaître tes voies","lyrics":"Éternel !  Fais-moi connaître tes voies"},
    {"book_id":1,"number":195,"title":"Voyez de quel amour","lyrics":"Voyez de quel amour Le Père nous a tous aimés !"},
    {"book_id":1,"number":196,"title":"Y'en a qui…","lyrics":"Y'en a qui sont petits"},
    {"book_id":1,"number":201,"title":"Mon auto","lyrics":"Mon auto, Jésus la guide, sûrement"}]`;
const songsTestClass = [
    new Song({ book_id: 0, number: 1, title: "J'aime l'Eternel", lyrics: "J'aime l'Éternel car Il entend ma voix" }),
    new Song({ book_id: 0, number: 2, title: "Quand je vois le ciel", lyrics: "Quand je vois le ciel, œuvre de tes doigts" }),
    new Song({ book_id: 0, number: 4, title: "Éternel! Fais-moi connaître tes voies", lyrics: "Éternel !  Fais-moi connaître tes voies" }),
    new Song({ book_id: 1, number: 195, title: "Voyez de quel amour", lyrics: "Voyez de quel amour Le Père nous a tous aimés !" }),
    new Song({ book_id: 1, number: 196, title: "Y'en a qui…", lyrics: "Y'en a qui sont petits" }),
    new Song({ book_id: 1, number: 201, title: "Mon auto", lyrics: "Mon auto, Jésus la guide, sûrement" })
]

const servicesTest =
    `[{"date":"20190602","songs":[0,2,4]},
    {"date":"20190609","songs":[5,1,3]}
    ]`;

describe("List* initialization happy paths", () => {
    it("should build ListBooks", () => {
        const lb = new ListBooks(booksTest);
        expect(lb.books.length).toBe(2);
        expect(lb.books[0].abbreviation).toBe('JEM');
        expect(lb.books[1].abbreviation).toBe('JemKids');
    });

    it("should build ListSongs", () => {
        const lb = new ListBooks(booksTest);
        const sb = new ListSongs(songsTest, lb);
        expect(sb.songs).toEqual(songsTestClass);
        // expect(sb.songs.length).toBe(songsTestClass.length);
        // for (let i = 0; i < sb.songs.length; i++) {
        //     expect(sb.songs[i]).toEqual(songsTestClass[i]);
        // }
    });

    it("should build ListServices", () => {
        const lb = new ListBooks(booksTest);
        const sb = new ListSongs(songsTest, lb);
        const eb = new ListServices(servicesTest);
        expect(eb.services.length).toBe(2);
        expect(eb.services[0].date).toBe("20190602");
        expect(eb.services[1].date).toBe("20190609");
        expect(eb.services[0].songs).toEqual([0, 2, 4]);
        expect(eb.services[1].songs).toEqual([5, 1, 3]);
        expect(eb.services[0].get_songs(sb)).toEqual([songsTestClass[0], songsTestClass[2], songsTestClass[4]]);
        expect(eb.services[1].get_songs(sb)).toEqual([songsTestClass[5], songsTestClass[1], songsTestClass[3]]);
    });
});