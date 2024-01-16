import { ListBooks, ListServices, ListSongs } from "./init";
import { Song } from "./song";

const booksTest = 
`JEM,J'aime l'Eternel
JEMKids,J'aime l'Eternel Kids`;

const songsTest = 
`JEM0001,J'aime l'Eternel
JEM1018,Une seule Eglise
JEMKids100,Moi c'est moi`;
const songsTestClass = [
    new Song(0, 1, "J'aime l'Eternel", ""),
    new Song(0, 1018, "Une seule Eglise", ""),
    new Song(1, 100, "Moi c'est moi", "")
]

const servicesTest =
`20231224,JEM0001|JEMKids100
20231231,JEM1018|JEMKids100`;

describe("List* initialization happy paths", () => {
    it("should build ListBooks", () => {
        const lb = new ListBooks(booksTest);
        expect(lb.books.length).toBe(2);
        expect(lb.books[0].abbreviation).toBe('JEM');
    });

    it("should build ListSongs", () => {
        const lb = new ListBooks(booksTest);
        const sb = new ListSongs(songsTest, lb);
        expect(sb.songs.length).toBe(songsTestClass.length);
        for (let i = 0; i < sb.songs.length; i++){
            expect(sb.songs[i]).toEqual(songsTestClass[i]);
        }
    });

    it("should build ListServices", () => {
        const lb = new ListBooks(booksTest);
        const sb = new ListSongs(songsTest, lb);
        const eb = new ListServices(servicesTest, lb, sb);
        expect(eb.services.length).toBe(2);
        expect(eb.services[0].date).toBe("20231224");
        expect(eb.services[1].date).toBe("20231231");
        expect(eb.services[0].songs).toEqual([0, 2]);
        expect(eb.services[1].songs).toEqual([1, 2]);
        expect(eb.services[0].get_songs(sb)).toEqual([songsTestClass[0], songsTestClass[2]]);
        expect(eb.services[1].get_songs(sb)).toEqual([songsTestClass[1], songsTestClass[2]]);
    });
});