import * as fs from 'fs';
import Axios from 'axios';
import { command, number, option, positional, run, string } from 'cmd-ts';
import { ListBooks } from '../src/lib/init';
import { ListSongs } from "../src/lib/song";
import { Keywords } from '../src/lib/keywords';

const app = command({
    name: 'get_keywords',
    args: {
        start: positional({ type: number, displayName: 'starting number' }),
        end: option({ type: number, long: 'end', short: 'e', defaultValue: () => -1 }),
    },
    handler: ({ start, end }) => {
        request_keywords(start, end);
    },
});

run(app, process.argv.slice(2));

async function request_keywords(start: number, end: number) {
    const query_nbr = 5;
    const songs_name = "../src/assets/songs.json";
    const books_name = "../src/assets/books.json";
    const keywords_name = "../src/assets/keywords.json";
    if (!fs.existsSync(songs_name)) {
        throw new Error(`Didn't find songs at ${songs_name}`);
    }
    if (!fs.existsSync(books_name)) {
        throw new Error(`Didn't find books at ${books_name}`);
    }

    const listBooks = new ListBooks(fs.readFileSync(books_name, "utf-8"));
    const listSongs = new ListSongs(fs.readFileSync(songs_name, "utf-8"));
    const listKeywords = new Keywords('{ "list": [], "keywords": []}');
    listKeywords.list = keywords;
    listKeywords.list.sort();

    if (end < 0) {
        end = listSongs.songs.length;
    }
    if (end <= start || start >= listSongs.songs.length) {
        throw new Error("start or end out of bounds");
    }
    for (let songIndex = start; songIndex < end; songIndex++) {
        const song = listSongs.songs[songIndex];
        console.log(`\n** Processing songs[${songIndex}]: ${song.get_book_number_title(listBooks)}`)
        try {
            const answers = new Map<number, number>();
            for (let query = 0; query < query_nbr; query++) {
                const request = {
                    "messages": [
                        { "role": "system", "content": "Below is an instruction that describes a task. Write a response that appropriately completes the request. Do not provide any explanation or further discussion of the text. Just give the result." },
                        { "role": "user", "content": prompt + song.lyrics }
                    ],
                    "temperature": 0.6,
                    "max_tokens": 100,
                    "stream": false
                };
                const response = await Axios.post('http://localhost:1234/v1/chat/completions', request);
                try {
                    const answer: string[] = JSON.parse(response.data.choices[0].message.content);
                    console.log(` ${query} - ${answer}`)
                    if (answer.length != nbr_keywords_lm) {
                        console.warn(`  ! Song gave wrong length: ${answer.length}`);
                    }
                    const keywords_unknown = [];
                    for (let i = 0; i < min(answer.length, nbr_keywords_lm); i++) {
                        const index = keywords.findIndex((kw) => kw === answer[i].toLowerCase());
                        if (index < 0) {
                            keywords_unknown.push(answer[i]);
                            continue;
                        }
                        answers.set(index, (answers.get(index) ?? 0) + nbr_keywords_lm - i);
                    }
                    if (keywords_unknown.length > 0) {
                        console.warn(`  Didn't find keywords: ${keywords_unknown}`);
                    }
                } catch (e) {
                    console.error(` ! Error in query: ${e}`);
                    console.log(response.data.choices[0].message.content);
                }
            }
            const sortedKeys: string[] = [...answers.keys()]
                .sort((k1, k2) => answers.get(k2)! - answers.get(k1)!)
                .map((k) => keywords[k]);
            console.log(` [${songIndex}] -> ${sortedKeys}`);
            listKeywords.songs.push({
                book_id: song.book_id,
                number: song.number,
                keywords: sortedKeys.slice(0, nbr_keywords)
            });
        } catch (e) {
            console.error(` ! Error while handling keywords: ${e}`);
            console.dir(song);
        }
    }
    fs.writeFileSync(keywords_name, listKeywords.toString());
}

const nbr_keywords = 5;
const nbr_keywords_lm = nbr_keywords * 2;

const keywords = [
    // JEM keywords
    "adoration",
    "appel",
    "autorité",
    "bénédiction",
    "combat spirituel",
    "confession",
    "consécration",
    "création",
    "danse",
    "deuil",
    "mort",
    "dieu",
    "écoute",
    "église",
    "engagement",
    "espérance",
    "évangélisation",
    "exhortation",
    "foi et confiance",
    "grâce",
    "identité",
    "intercession",
    "intimité",
    "israël",
    "jésus-christ",
    "joie",
    "célébration",
    "louange",
    "mission",
    "passion",
    "amour",
    "partage",
    "père",
    "prière",
    "proclamation",
    "prophétique",
    "reconnaissance",
    "repentance",
    "réveil",
    "sacrifice",
    "sainte-cène",
    "saint-esprit",
    "salut",
    "trinité",
    "unité",
    "victoire",
    // Additional keywords
    "gratitude",
    "vérité",
    "gloire",
    "délivrance",
    "miséricorde",
    "paix",
    "sainteté",
    "pardon",
    "pâques",
    "noël",
    "éternel",
    "espoir",
    "confiance",
    "épreuve",
];

const prompt = `Pour le chant suivant, donne-moi un JSON avec un tableau des ${nbr_keywords_lm} mots clés 
les plus utiles pour le décrire. Les ${nbr_keywords_lm} mots doivent être choisis parmi 
les mots suivants:

${keywords.join(" ")}

Met le mot qui décrit le chant le mieux d'abord, puis les mots qui décrivent moins bien. 
Ecris les mots dans un tableau JSON. 
Utilise seulement des mots de la liste en-haut. 
Ne donne pas non plus d'explications ou d'autres ajouts. 
Seulement les ${nbr_keywords_lm} mots que tu as choisis en JSON. 
Ecris seulement le JSON. 
Le JSON doit avoir le format suivant:

[ 
"mot1",
"mot2",
"mot3",
"mot4",
"mot5"
]

Voici le chant à analyzer:
`;

function min(a: number, b: number): number {
    return a < b ? a : b;
}

/**
https://platform.openai.com/docs/api-reference/chat/create

curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant. Follow the instructions given to the best of your abilities."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'
*/
