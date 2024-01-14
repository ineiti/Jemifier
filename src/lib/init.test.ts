import { ListBooks } from "./init";

describe("ListBook initialization", () => {
    it("should work", () => {
        const lb = new ListBooks("");
        expect(lb.books.length == 2);
    })
});