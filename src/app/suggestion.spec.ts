import { Suggestion } from "./suggestion"

describe("Suggestion", () => {
    it("adds suggestions", () => {
        const s = new Suggestion();

        s.addSuggestion([0, 1]);
        expect(s.list.size).toBe(1);
        expect(s.probability).toBe(1);

        s.addSuggestion([0, 1]);
        s.addSuggestion([0, 1]);
        expect(s.list.size).toBe(1);
        expect(s.probability).toBe(3);
        {
            const one = s.list.get(0);
            expect(one?.list.size).toBe(1);
            expect(one?.probability).toBe(3);
        }

        s.addSuggestion([0, 2]);
        {
            const one = s.list.get(0);
            expect(one?.list.size).toBe(2);
            expect(one?.probability).toBe(4);
        }
    });

    it("calculates probabilities", () => {
        const s = new Suggestion();
        s.addSuggestion([0, 1]);
        s.addSuggestion([0, 1]);
        s.addSuggestion([0, 1]);
        s.addSuggestion([0, 2]);
        s.sumSuggestions();

        expect(s.list.get(0)?.list.get(1)?.probability).toBe(0.75);
        expect(s.list.get(0)?.list.get(2)?.probability).toBe(0.25);
    })

    it("returns ordered probabilities", () => {
        const s = new Suggestion();
        [[0, 1], [0, 1], [0, 2, 1], [0, 2, 1], [0, 2, 3], [0, 2, 3], [0, 2, 3], [0, 2, 4],
        [2, 5], [2, 6], [2, 6], [2, 4], [2, 4], [2, 4]]
            .forEach((chain) => s.addSuggestion(chain));

        expect(s.getSuggestions([3])).toEqual([]);
        expect(s.getSuggestions([2])).toEqual([4, 6, 5]);
        expect(s.getSuggestions([0])).toEqual([2, 1]);
        expect(s.getSuggestions([0, 2])).toEqual([3, 1, 4]);
        expect(s.getSuggestionsAll([0, 2])).toEqual([3, 1, 4, 6, 5]);
        expect(s.getSuggestions([0, 3])).toEqual([]);
    })
})