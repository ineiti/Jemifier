import { ListBooks, ListServices } from "./init";
import { ListSongs } from "./song";
import { Song } from "./song";

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
    new Song(0, { book_id: 0, number: 1, author: "something", title: "J'aime l'Eternel", lyrics: "J'aime l'Éternel car Il entend ma voix" }),
    new Song(1, { book_id: 0, number: 2, author: "something", title: "Quand je vois le ciel", lyrics: "Quand je vois le ciel, œuvre de tes doigts" }),
    new Song(2, { book_id: 0, number: 4, author: "something", title: "Éternel! Fais-moi connaître tes voies", lyrics: "Éternel !  Fais-moi connaître tes voies" }),
    new Song(3, { book_id: 1, number: 195, author: "something", title: "Voyez de quel amour", lyrics: "Voyez de quel amour Le Père nous a tous aimés !" }),
    new Song(4, { book_id: 1, number: 196, author: "something", title: "Y'en a qui…", lyrics: "Y'en a qui sont petits" }),
    new Song(5, { book_id: 1, number: 201, author: "something", title: "Mon auto", lyrics: "Mon auto, Jésus la guide, sûrement" })
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
        const sb = new ListSongs(songsTest);
        expect(sb.songs).toEqual(songsTestClass);
        // expect(sb.songs.length).toBe(songsTestClass.length);
        // for (let i = 0; i < sb.songs.length; i++) {
        //     expect(sb.songs[i]).toEqual(songsTestClass[i]);
        // }
    });

    it("should build ListServices", () => {
        const lb = new ListBooks(booksTest);
        const sb = new ListSongs(songsTest);
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