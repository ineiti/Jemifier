export class Book {
    abbreviation: string;
    full_name: string;

    constructor(abbreviation: string, full_name: string){
        this.abbreviation = abbreviation;
        this.full_name = full_name;
    }

    static from_array(fields: string[]): Book {
        return new Book(fields[0], fields[1]);
    }
}