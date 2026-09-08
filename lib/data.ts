export type Song = {
  id: string;
  title: string;
  titleJapanese?: string;
  release: string;
  year: number;
  duration: string;
};

export type Artist = {
  id: string;
  name: string;
  nameJapanese: string;
  initials: string;
  accent: string;
  accentSoft: string;
  genres: string[];
  bio: string;
  debut: number;
  youtube: string;
  spotify: string;
  songs: Song[];
};

export const artists: Artist[] = [
  {
    id: "yoasobi",
    name: "YOASOBI",
    nameJapanese: "ヨアソビ",
    initials: "YO",
    accent: "#e24a73",
    accentSoft: "#53243c",
    genres: ["J-Pop", "Electropop"],
    debut: 2019,
    youtube: "7.1M",
    spotify: "9.8M",
    bio: "A duo built around turning stories into music, pairing vivid electronic production with expressive vocals.",
    songs: [
      { id: "idol", title: "Idol", titleJapanese: "アイドル", release: "Idol", year: 2023, duration: "3:33" },
      { id: "yoru-ni-kakeru", title: "Racing Into the Night", titleJapanese: "夜に駆ける", release: "The Book", year: 2019, duration: "4:21" },
      { id: "gunjo", title: "Blue", titleJapanese: "群青", release: "The Book", year: 2020, duration: "4:08" },
    ],
  },
  {
    id: "ado",
    name: "Ado",
    nameJapanese: "アド",
    initials: "AD",
    accent: "#5271ff",
    accentSoft: "#202f69",
    genres: ["J-Pop", "Rock"],
    debut: 2020,
    youtube: "8.2M",
    spotify: "6.5M",
    bio: "A powerhouse vocalist recognised for theatrical performances, dramatic range, and genre-bending pop production.",
    songs: [
      { id: "usseewa", title: "Usseewa", titleJapanese: "うっせぇわ", release: "Kyogen", year: 2020, duration: "3:26" },
      { id: "new-genesis", title: "New Genesis", titleJapanese: "新時代", release: "Uta's Songs", year: 2022, duration: "3:49" },
      { id: "show", title: "Show", titleJapanese: "唱", release: "Show", year: 2023, duration: "3:09" },
    ],
  },
  {
    id: "fujii-kaze",
    name: "Fujii Kaze",
    nameJapanese: "藤井 風",
    initials: "FK",
    accent: "#e8a64b",
    accentSoft: "#594326",
    genres: ["J-Pop", "R&B"],
    debut: 2019,
    youtube: "4.6M",
    spotify: "7.3M",
    bio: "A singer-songwriter and pianist whose relaxed vocals blend pop, soul, jazz, and contemporary R&B.",
    songs: [
      { id: "shinunoga-e-wa", title: "Shinunoga E-Wa", titleJapanese: "死ぬのがいいわ", release: "Help Ever Hurt Never", year: 2020, duration: "3:06" },
      { id: "matsuri", title: "Matsuri", titleJapanese: "まつり", release: "Love All Serve All", year: 2022, duration: "3:45" },
      { id: "kirari", title: "Kirari", titleJapanese: "きらり", release: "Love All Serve All", year: 2021, duration: "3:51" },
    ],
  },
  {
    id: "atarashii-gakko",
    name: "ATARASHII GAKKO!",
    nameJapanese: "新しい学校のリーダーズ",
    initials: "AG",
    accent: "#28b99b",
    accentSoft: "#1f504a",
    genres: ["J-Pop", "Dance"],
    debut: 2015,
    youtube: "2.2M",
    spotify: "3.1M",
    bio: "A four-member group known for high-energy choreography, playful individuality, and adventurous pop sounds.",
    songs: [
      { id: "otona-blue", title: "Otonablue", titleJapanese: "オトナブルー", release: "Ichijikikoku", year: 2020, duration: "3:04" },
      { id: "tokyo-calling", title: "Tokyo Calling", release: "AG! Calling", year: 2023, duration: "3:10" },
      { id: "fly-high", title: "Fly High", release: "AG! Calling", year: 2024, duration: "3:16" },
    ],
  },
  {
    id: "kenshi-yonezu",
    name: "Kenshi Yonezu",
    nameJapanese: "米津玄師",
    initials: "KY",
    accent: "#a873e8",
    accentSoft: "#402d5b",
    genres: ["J-Pop", "Alternative"],
    debut: 2009,
    youtube: "7.4M",
    spotify: "5.9M",
    bio: "A singer-songwriter, producer, and illustrator celebrated for distinctive melodies and imaginative visual worlds.",
    songs: [
      { id: "lemon", title: "Lemon", release: "Stray Sheep", year: 2018, duration: "4:16" },
      { id: "kick-back", title: "Kick Back", release: "Kick Back", year: 2022, duration: "3:13" },
      { id: "lady", title: "Lady", release: "Lady", year: 2023, duration: "3:29" },
    ],
  },
  {
    id: "aimyon",
    name: "Aimyon",
    nameJapanese: "あいみょん",
    initials: "AM",
    accent: "#e56743",
    accentSoft: "#5d3026",
    genres: ["J-Pop", "Folk Pop"],
    debut: 2015,
    youtube: "2.3M",
    spotify: "4.8M",
    bio: "A singer-songwriter whose direct lyrics and warm guitar-led sound bring an intimate feel to modern pop.",
    songs: [
      { id: "marigold", title: "Marigold", titleJapanese: "マリーゴールド", release: "Momentary Sixth Sense", year: 2018, duration: "5:06" },
      { id: "hadaka-no-kokoro", title: "Naked Heart", titleJapanese: "裸の心", release: "Heard That There's Good Pasta", year: 2020, duration: "4:56" },
      { id: "ai-wo-tsutaetaidatoka", title: "I Want to Tell You I Love You", titleJapanese: "愛を伝えたいだとか", release: "Excitement of Youth", year: 2017, duration: "3:55" },
    ],
  },
];

export const genres = ["All", ...Array.from(new Set(artists.flatMap((artist) => artist.genres)))];

export const getArtist = (id: string) => artists.find((artist) => artist.id === id);
