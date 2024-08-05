import { Service } from "../lib/service";
import { Song } from "../lib/song";

export class Suggestion {
    list: Map<number, Suggestion> = new Map();
    probability = 0;

    addSuggestion(chain: number[]) {
        this.probability++;
        if (chain.length === 0) {
            return
        }

        if (!this.list.has(chain[0])) {
            this.list.set(chain[0], new Suggestion());
        }
        this.list.get(chain[0])?.addSuggestion(chain.slice(1));
    }

    sumSuggestions() {
        const sum = [...this.list.values()].reduce((p, c) => p + c.probability, 0);
        for (const s of this.list.values()) {
            s.probability /= sum;
            s.sumSuggestions();
        }
    }

    getSuggestionsAll(chain: number[]): number[] {
        const sugg = this.getSuggestions(chain);
        for (let start = 1; start < chain.length; start++) {
            const short = this.getSuggestions(chain.slice(start))
                .filter((s) => !sugg.includes(s));
            sugg.push(...short);
        }

        return sugg;
    }

    getSuggestions(chain: number[]): number[] {
        if (chain.length > 0) {
            const sub = this.list.get(chain[0]);
            if (sub !== undefined) {
                return sub.getSuggestions(chain.slice(1));
            }
            return [];
        }

        const suggs = [...this.list.entries()].map(([n, s]) => [n, s.probability]);
        suggs.sort((a, b) => b[1] - a[1]);
        return suggs.map(([n, p]) => n);
    }

    static createSuggestions(services: Service[]): Suggestion {
        const s = new Suggestion();
        for (const service of services) {
            for (let start = 0; start < service.songs.length - 1; start++) {
                s.addSuggestion(service.songs.slice(start));
            }
        }

        return s;
    }
}