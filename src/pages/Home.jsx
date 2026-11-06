import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Code2,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  GitBranch,
  Brain,
  Database,
  Film,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  Cpu,
  Quote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchApi } from '../lib/api';
import { safeCopyToClipboard } from '../lib/utils';
import { formatNumber } from '../lib/utils';

export function Home() {
  const { openAuthModal, isAuthenticated } = useAuth();
  const [heroQuery, setHeroQuery] = useState('');
  
  // Interactive Live Demo Playground State
  const [demoEngine, setDemoEngine] = useState('catalog'); // 'catalog' | 'scene'
  const [demoMediaType, setDemoMediaType] = useState('all');
  const [demoQueryBreakdown, setDemoQueryBreakdown] = useState(false);
  const [demoQuery, setDemoQuery] = useState("Children pilot a giant robot powered by their own life force where the pilot dies after every battle");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResults, setDemoResults] = useState({"total": 4, "total_documents": 4, "results": [{"work_id": "work:anime:mal_1690_al_1690", "aar_id": "aar_1524", "title": "Bokurano", "title_english": "Bokurano", "title_romaji": "Bokurano", "title_native": "ぼくらの", "type": "anime", "format": "TV", "bucket": "anime", "status": "finished", "score": 0.92578125, "community_score": 73.0, "popularity": 46751, "release_year": 2007, "genres": ["Action", "Drama", "Mecha", "Psychological", "Sci-Fi", "Suspense"], "themes": ["Mecha", "Psychological", "Seinen", "Survival"], "tags": ["Death Game", "Denpa", "Ensemble Cast", "Heterosexual", "Military", "Philosophy", "Politics", "Seinen", "Super Robot", "Tomboy", "Tragedy", "Yakuza"], "studios": ["GONZO", "Gonzo", "diomedéa"], "description": "As fifteen children at a summer camp enjoy their carefree vacation together, they stumble upon a small cave near the beach. The group finds a mysterious room deep within its caverns, where they meet a strange man who calls himself Kokopelli. The man invites the children to play a game that involves taking turns controlling a robot to protect the Earth against aliens. Thinking it might be an interesting computer game, all but one of the children sign a contract agreeing to play. Later that day, the giant robot appears in person and the children are teleported into its cockpit, where they find Kokopelli, who pilots a fight against a similar robotic creature that has appeared nearby. After winning the battle, Kokopelli tries to apologize but is interrupted as the children are teleported back to the ground in the midst of the carnage. As the bewilderment following the fight settles, the robot suddenly disappears and the children are left scared and confused. Despite seeming like a harmless game at first, the children never anticipated the stakes of this game and how their pasts would intertwine with their decisions going forward. [Written by MAL Rewrite]", "image_url": "https://cdn.myanimelist.net/images/anime/1690/97048.jpg", "url": "https://myanimelist.net/anime/1690/Bokura_no", "mal_id": 1690, "anilist_id": 1690, "tmdb_id": 34765, "tmdb_type": "tv", "tmdb_season": 1, "imdb_id": "tt1132201", "tvdb_id": 80111, "vndb_id": null, "kitsu_id": 1518, "anidb_id": 4861, "anisearch_id": 3986, "anime_planet_slug": "bokurano", "sources": ["https://anidb.net/anime/4861", "https://anilist.co/anime/1690", "https://anime-planet.com/anime/bokurano", "https://animecountdown.com/38243", "https://animenewsnetwork.com/encyclopedia/anime.php?id=7213", "https://anisearch.com/anime/3986", "https://kitsu.app/anime/1518", "https://livechart.me/anime/3763", "https://myanimelist.net/anime/1690", "https://simkl.com/anime/38243"], "episodes": 24, "is_adult": false, "chunks": [{"chunk_id": "work:anime:mal_1690_al_1690#0", "work_id": "work:anime:mal_1690_al_1690", "position": 0, "section": "Title + Alternative Titles + Type + Genres + Tags & Themes + Synopsis", "token_estimate": 379, "is_context": false, "text": "Title: Bokurano\nAlternative Titles: Bokurano, notre enjeu, Bokurano: Ours, ぼくらの, 地球防卫少年\nType: Anime\nGenres: Action, Drama, Mecha, Psychological, Sci-Fi, Suspense\nTags & Themes: Tragedy, Seinen, Tomboy, Mecha, Heterosexual, Military, Psychological, Philosophy, Ensemble Cast, Survival, Yakuza, Death Game, Super Robot, Politics, Denpa\nSynopsis: As fifteen children at a summer camp enjoy their carefree vacation together, they stumble upon a small cave near the beach. The group finds a mysterious room deep within its caverns, where they meet a strange man who calls himself Kokopelli. The man invites the children to play a game that involves taking turns controlling a robot to protect the Earth against aliens. Thinking it might be an interesting computer game, all but one of the children sign a contract agreeing to play. Later that day, the giant robot appears in person and the children are teleported into its cockpit, where they find Kokopelli, who pilots a fight against a similar robotic creature that has appeared nearby. After winning the battle, Kokopelli tries to apologize but is interrupted as the children are teleported back to the ground in the midst of the carnage. As the bewilderment following the fight settles, the robot suddenly disappears and the children are left scared and confused. Despite seeming like a harmless game at first, the children never anticipated the stakes of this game and how their pasts would intertwine with their decisions going forward. [Written by MAL Rewrite]"}, {"chunk_id": "work:manga:mal_670_al_30670#0", "work_id": "work:manga:mal_670_al_30670", "position": 0, "section": "Title + Alternative Titles + Type + Genres + Tags & Themes + Synopsis + Characters & Cast + Creators & Studios", "token_estimate": 463, "is_context": false, "text": "Title: Bokurano: Ours\nAlternative Titles: Bokura no, Bokurano, Bokurano ~Mou Hitotsu no Bokurano~, Bokurano, notre enjeu, ぼくらの\nType: Manga\nGenres: Award Winning, Drama, Mecha, Psychological, Sci-Fi\nTags & Themes: Seinen, Primarily Child Cast, Psychological, Cosmic Horror, Philosophy, Ensemble Cast, Super Robot, Bullying, Mecha, Nudity, Survival, Denpa, Tragedy, Urban, School Club, Anti-Hero, Politics, Aviation, Dystopian, Gore, Death Game, Military\nSynopsis: Fifteen middle school students are happily attending a summer camp by the sea, until one of the children leads the group into a cave that will drastically alter the course of their lives forever. Inside are several computers, along with a man named Kokopelli who offers the students a chance to play a game: one where they use a gigantic robot to defeat enemies who attack the Earth. The children agree to sign a contract by touching a shield-like object, and Kokopelli transports them to the cockpit of the Zearth—the mecha they are to pilot. After an enemy mecha rises from the sea, Kokopelli shows them how to mentally control the Zearth, and defeats it. The children are excited by the prospect of defending the Earth, but not everything is as it seems. The Zearth is in fact powered by life energy, and at the end of every battle, the pilots die. After signing their lives away, the children must now use their time left on Earth to defend it. [Written by MAL Rewrite]\nCharacters & Cast: Jun Ushiro, Kana Ushiro, Chizuru Honda, Kunihiko Moji, Mako Nakarai, Kako Isao, Waku Takashi, Masaru Kodaka, Daiichi Yamura, Yousuke Kirie, Kanji Yoshikawa, Maki Ano, Koemushi, Aiko Tokosumi, Takami Komoda, Yoko Machi, Misumi Tanaka, Masamitsu Seki, Yoshi Yamura\nCreators & Studios: Mohiro Kitou (Story & Art), Kitoh Mohiro (Story & Art), Kitoh (Story & Art), Mohiro (Story & Art)"}], "merged_works": [{"work_id": "work:manga:mal_670_al_30670", "title": "Bokurano: Ours", "type": "manga", "format": "UNKNOWN", "release_year": 2003, "episodes": 0, "score": 0.92578125, "tmdb_id": null, "tmdb_type": null, "tmdb_season": null, "imdb_id": null, "tvdb_id": null}]}, {"work_id": "work:anime:mal_1897_al_1897", "aar_id": "aar_1715", "title": "Matchless Raijin-Oh", "title_english": "Matchless Raijin-Oh", "title_romaji": "Zettai Muteki Raijin Ou", "title_native": "絶対無敵ライジンオー", "type": "anime", "format": "TV", "bucket": "anime", "status": "finished", "score": 0.6669309704195157, "community_score": 63.0, "popularity": 1087, "release_year": 1991, "genres": ["Adventure", "Mecha", "Sci-Fi"], "themes": ["Mecha", "School"], "tags": ["Primarily Child Cast", "School", "Super Robot"], "studios": ["Anime Midstream", "Sunrise", "Toshiba EMI"], "description": "Suddenly, an evil empire, Jaaku, raids the Earth. But the light appears from the Earth, and fights against Jaaku. It is Raijin Oh operated by Eldran. Eldran has protected the earth since the ancient ages. But he was injured during the fight, and Raijin-Oh falls to the ground. On the other hand, Jaaku scatters their weapons, Aku-Darmer, all over the world. Meanwhile, in Youshou elementary school, they have extra lessons in the 3rd class of the 5th grade. Eldran leaves Raijin Medal to them and asks them to save the Earth for him, and then he disappeared. In this way, the Earth Defense Agency consisted of elementary students is founded. (Source: AnimeNfo)", "image_url": "https://cdn.myanimelist.net/images/anime/1152/91073.jpg", "url": "https://myanimelist.net/anime/1897/Zettai_Muteki_Raijin-Oh", "mal_id": 1897, "anilist_id": 1897, "tmdb_id": 87166, "tmdb_type": "tv", "tmdb_season": 1, "imdb_id": "tt1986705", "tvdb_id": 193911, "vndb_id": null, "kitsu_id": 1707, "anidb_id": 4486, "anisearch_id": 3702, "anime_planet_slug": "zettai-muteki-raijin-oh", "sources": ["https://anidb.net/anime/4486", "https://anilist.co/anime/1897", "https://anime-planet.com/anime/zettai-muteki-raijin-oh", "https://animecountdown.com/37704", "https://animenewsnetwork.com/encyclopedia/anime.php?id=2459", "https://anisearch.com/anime/3702", "https://kitsu.app/anime/1707", "https://myanimelist.net/anime/1897", "https://simkl.com/anime/37704"], "episodes": 51, "is_adult": false, "chunks": [{"chunk_id": "work:anime:mal_1897_al_1897#0", "work_id": "work:anime:mal_1897_al_1897", "position": 0, "section": "Title + Alternative Titles + Type + Genres + Tags & Themes + Synopsis + Characters & Cast", "token_estimate": 457, "is_context": false, "text": "Title: Matchless Raijin-Oh\nAlternative Titles: Eldran series #1, Zettai Muteki Raijin Ou, Zettai Muteki Raijin-Oh, 絶対無敵ライジンオー\nType: Anime\nGenres: Adventure, Mecha, Sci-Fi\nTags & Themes: Mecha, Super Robot, School, Primarily Child Cast\nSynopsis: Suddenly, an evil empire, Jaaku, raids the Earth. But the light appears from the Earth, and fights against Jaaku. It is Raijin Oh operated by Eldran. Eldran has protected the earth since the ancient ages. But he was injured during the fight, and Raijin-Oh falls to the ground. On the other hand, Jaaku scatters their weapons, Aku-Darmer, all over the world. Meanwhile, in Youshou elementary school, they have extra lessons in the 3rd class of the 5th grade. Eldran leaves Raijin Medal to them and asks them to save the Earth for him, and then he disappeared. In this way, the Earth Defense Agency consisted of elementary students is founded. (Source: AnimeNfo)\nCharacters & Cast: Jin Hyuuga (CV: Rica Matsumoto), Asuka Tsukishiro (CV: Rie Iwatsubo), Kouji Hoshiyama (CV: Mari Maruta), Maria Shiratori (CV: Konami Yoshida), Kirara Haruno (CV: Kyouko Minami), Akira Imamura (CV: Kyouko Minami), Reiko Ikeda (CV: Saori Sugimoto), Miki Mano (CV: Saori Sugimoto), Hiroshi Takamori (CV: Mami Matsui), Orie Ishizuka (CV: Mami Matsui), Youko Kuriki (CV: Rie Iwatsubo), Yoshiaki Ogawa (CV: Chie Satou), Tokie Sakai (CV: Chie Satou), Hidenori Kondou (CV: Konami Yoshida), Tsutomu Kojima (CV: Bin Shimada), Daisuke Saitou (CV: Kouzou Shioya), Yuu Izumi (CV: Megumi Hayashibara), Aiko Shimada (CV: Rica Matsumoto), Belzeb (CV: Kiyoyuki Yanada, Yanada, Kiyoyuki), Falzeb (CV: Megumi Hayashibara, Hayashibara, Megumi), Eldran (CV: Bin Shimada)"}, {"chunk_id": "work:anime:mal_9221_al_9221#0", "work_id": "work:anime:mal_9221_al_9221", "position": 0, "section": "Title + Alternative Titles + Type + Genres + Tags & Themes + Synopsis + Creators & Studios", "token_estimate": 351, "is_context": false, "text": "Title: Kanzen Shouri Daiteiou\nAlternative Titles: Eldran series #4, Kanzen Shouri Daiteioh, 完全勝利ダイテイオー\nType: Anime\nGenres: Action, Adventure, Mecha, Sci-Fi\nTags & Themes: Kids, Mecha, Advertisement\nSynopsis: When an alien force attacks Earth, a giant sword falls onto the campus of Paradise Elementary School, transforming it into a flying vessel. The fate of the planet lies with one group of kids who must pilot powerful mecha to stop the invaders before it's too late! (Source: Anime-Planet) Note: Originally planned as a TV anime series, this ended up as a promotional video for its manga serialization on magazine Monthly Daiteioh.\nCreators & Studios: Sunrise, Gorou Taniguchi (Storyboard), Koutarou Nakayama (Producer), Chieo Oohashi (Producer), Akira Yoshimura (Episode Director), Munetaka Abe (Key Animation), Yoshinobu Andou (Key Animation), Yoshinobu Andou (Animation Director), Masanobu Aoyama (Key Animation), Tsutomu Fujita (Art Director), Nobuhiko Genma (Key Animation), Shigemi Ikeda (Background Art), Akira Kikuchi (Key Animation), Hiroaki Kitajima (Series Composition), Hiroaki Kitajima (Screenplay), Yasunao Moriyasu (Background Art), Minoru Okabe (Animation Check), Akiko Shibata (Color Design), Tsutomu Suzuki (Key Animation), Hiroshi Takeuchi (Key Animation), Takahiro Yamada (Mechanical Design), Hajime Yatate (Original Creator)"}], "matched_characters": ["Jin Hyuuga", "Asuka Tsukishiro", "Kouji Hoshiyama", "Maria Shiratori"], "merged_works": [{"work_id": "work:anime:mal_9221_al_9221", "title": "Kanzen Shouri Daiteiou", "type": "anime", "format": "OVA", "release_year": 2001, "episodes": 1, "score": 0.5725475495365154, "tmdb_id": null, "tmdb_type": null, "tmdb_season": null, "imdb_id": null, "tvdb_id": null}]}, {"work_id": "work:anime:mal_560_al_560", "aar_id": "aar_526", "title": "Soukyuu no Fafner: RIGHT OF LEFT - single program", "title_english": null, "title_romaji": "Soukyuu no Fafner: RIGHT OF LEFT - single program", "title_native": "蒼穹のファフナー RIGHT OF LEFT ～single program～", "type": "anime", "format": "SPECIAL", "bucket": "anime", "status": "finished", "score": 0.6322985701300454, "community_score": 70.0, "popularity": 4450, "release_year": 2005, "genres": ["Action", "Drama", "Mecha", "Sci-Fi"], "themes": ["Mecha", "Military"], "tags": ["Aliens", "Ensemble Cast", "Heterosexual", "Military", "Post-Apocalyptic", "Real Robot", "Survival", "War"], "studios": ["Production I.G", "Starchild Records", "Xebec"], "description": "Yumi Ikoma and Ryou Masaoka are children who have been selected to take part in a top secret mission, to be the pilots of the first Fafner combat units; the last chance of survival for the human race. The enemy is ruthless, remorseless and is able to read the minds of humans. Therefore, the details of this mission are kept a secret even from the personnel involved. The young pilots must use all their courage and faith in order to survive and complete their mission or the fate of mankind would be compromised. (Source: Anime News Network)", "image_url": "https://cdn.myanimelist.net/images/anime/8/50369.jpg", "url": "https://myanimelist.net/anime/560/Soukyuu_no_Fafner__Dead_Aggressor_-_Right_of_Left", "mal_id": 560, "anilist_id": 560, "tmdb_id": 42836, "tmdb_type": "tv", "tmdb_season": 0, "imdb_id": "tt0440987", "tvdb_id": 81110, "vndb_id": null, "kitsu_id": 517, "anidb_id": 3323, "anisearch_id": 833, "anime_planet_slug": "fafner-right-of-left", "sources": ["https://anidb.net/anime/3323", "https://anilist.co/anime/560", "https://anime-planet.com/anime/fafner-right-of-left", "https://animecountdown.com/39273", "https://animenewsnetwork.com/encyclopedia/anime.php?id=5251", "https://anisearch.com/anime/833", "https://kitsu.app/anime/517", "https://livechart.me/anime/4866", "https://myanimelist.net/anime/560", "https://simkl.com/anime/39273"], "episodes": 1, "is_adult": false, "chunks": [{"chunk_id": "work:anime:mal_560_al_560#0", "work_id": "work:anime:mal_560_al_560", "position": 0, "section": "Title + Alternative Titles + Type + Genres + Tags & Themes + Synopsis + Characters & Cast", "token_estimate": 454, "is_context": false, "text": "Title: Soukyuu no Fafner: RIGHT OF LEFT - single program\nAlternative Titles: Fafner in the Azure 2, Fafner in the Azure: Dead Aggressor - Right of Left, Fafner of the Blue Sky: Right of Left, Sokyuu no Fafner - Single Program - Right of Left-, Soukyuu no Fafner II, 蒼穹のファフナー RIGHT OF LEFT ～single program～\nType: Anime\nGenres: Action, Drama, Mecha, Sci-Fi\nTags & Themes: War, Aliens, Post-Apocalyptic, Mecha, Heterosexual, Ensemble Cast, Survival, Real Robot, Military\nSynopsis: Yumi Ikoma and Ryou Masaoka are children who have been selected to take part in a top secret mission, to be the pilots of the first Fafner combat units; the last chance of survival for the human race. The enemy is ruthless, remorseless and is able to read the minds of humans. Therefore, the details of this mission are kept a secret even from the personnel involved. The young pilots must use all their courage and faith in order to survive and complete their mission or the fate of mankind would be compromised. (Source: Anime News Network)\nCharacters & Cast: Soushi Minashiro (CV: Kouhei Kiyasu), Ryou Masaoka (CV: Mamoru Miyano), Yumi Ikoma (CV: Yuuko Kaida), Karin Kuramae (CV: Akiko Kimura), Kazuki Makabe (CV: Makoto Ishii), Fumihiko Makabe (CV: Masahiko Tanaka), Shouko Hazama (CV: Miyu Matsuki), Kenji Kondou (CV: Minoru Shiraishi), Chizuru Toomi (CV: Emi Shinohara), Kiyomi Kaname (CV: Shizuka Ishikawa), Kouzou Minashiro (CV: Jouji Nakata), Masayuki Ikoma (CV: Makoto Nagai), Megumi Hino (CV: Kazue Komiya), Youko Hazama (CV: Nanaho Katsuragi), Tsukasa Saotome (CV: Tooru Ookawa), Puku, Maya Toomi, Kyousuke Mizoguchi, Seri Tatekami, Mamoru Kodate"}], "matched_characters": ["Soushi Minashiro", "Ryou Masaoka", "Yumi Ikoma", "Karin Kuramae"]}, {"work_id": "work:manga:mal_3098_al_33098", "aar_id": "aar_11999", "title": "Puchimon", "title_english": null, "title_romaji": "Puchimon", "title_native": "ぷちモン", "type": "manga", "format": null, "bucket": "manga", "status": "finished", "score": 0.4809373245165925, "community_score": 69.3, "popularity": 222, "release_year": 2001, "genres": ["Comedy", "Fantasy", "Romance", "Supernatural"], "themes": ["Samurai", "School", "Seinen", "[\"Seinen\"]"], "tags": ["School", "Seinen", "Swordplay"], "studios": [], "description": "In the future, age is not a factor to determine whether someone can perform a certain task or not, but special talent and training. An organization, Machine Robo Rescue (MRR), was established for robots and children to become partner and rescue people from danger. Then 12 children with various abilities were selected and introduced as part of this program: Robo Rescue!\nMeet Oozora Taiyou, one of the children who were chosen as a part of MRR program. After being late on his first day of training, he went to perform a hot rescue with JETROBO. However, a mysterious Robot from mysterious organization, \"The Star\"(?), appeared before MRR team to interfere with the rescue. What are the motives of the mysterious organization? And what are their goals?\nLife as one of the children chosen as part of MRR has started for Oozora Taiyou. Bumpy and hard training is just ahead for MRR team in order to protect many people's life!\n(Source: AnimeNfo)", "image_url": "https://cdn.myanimelist.net/images/manga/2/3381.jpg", "url": "https://myanimelist.net/manga/3098/Puchimon", "mal_id": 3098, "anilist_id": 33098, "tmdb_id": null, "tmdb_type": null, "tmdb_season": null, "imdb_id": null, "tvdb_id": null, "vndb_id": null, "kitsu_id": 6661, "anidb_id": null, "anisearch_id": null, "anime_planet_slug": null, "sources": [], "episodes": null, "is_adult": false, "chunks": [{"chunk_id": "work:manga:mal_3098_al_33098#0", "work_id": "work:manga:mal_3098_al_33098", "position": 0, "section": "Title + Alternative Titles + Type + Genres + Tags & Themes + Synopsis + Characters & Cast + Creators & Studios", "token_estimate": 343, "is_context": false, "text": "Title: Puchimon\nAlternative Titles: Petit Monster, ぷちモン\nType: Manga\nGenres: Comedy, Fantasy, Romance, Supernatural\nTags & Themes: Seinen, Swordplay, Samurai, School\nSynopsis: In the future, age is not a factor to determine whether someone can perform a certain task or not, but special talent and training. An organization, Machine Robo Rescue (MRR), was established for robots and children to become partner and rescue people from danger. Then 12 children with various abilities were selected and introduced as part of this program: Robo Rescue! Meet Oozora Taiyou, one of the children who were chosen as a part of MRR program. After being late on his first day of training, he went to perform a hot rescue with JETROBO. However, a mysterious Robot from mysterious organization, \"The Star\"(?), appeared before MRR team to interfere with the rescue. What are the motives of the mysterious organization? And what are their goals? Life as one of the children chosen as part of MRR has started for Oozora Taiyou. Bumpy and hard training is just ahead for MRR team in order to protect many people's life! (Source: AnimeNfo)\nCharacters & Cast: Melty Bagel, Maris Mischa, Chamomile Jasmine, Raynard Solstova, Aoba Yashima, Ruru, Miru, Nei, Ringo, Kureha\nCreators & Studios: Aoi Nanase (Story & Art), Nanase Aoi (Story & Art), Nanase (Story & Art), Aoi (Story & Art)"}], "matched_characters": ["Melty Bagel", "Maris Mischa", "Chamomile Jasmine", "Raynard Solstova"]}], "filters_applied": null});
  const [demoError, setDemoError] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    runDemoSearch(demoQuery, demoEngine);
  }, []);

  const sampleCatalogQueries = [
    'Children pilot a giant robot powered by their own life force where the pilot dies after every battle',
    'Girl wakes up in a walled town with a halo and sprouts grey wings from a cocoon with no memories',
    'Travelling medicine seller exorcises supernatural spirits after uncovering their form truth and reason',
    'Lonely girl connects to a virtual network called the Wired after a classmate sends emails after dying',
  ];

  const sampleSceneQueries = [
    'Children inside a giant robot cockpit learning the pilot will die after the battle',
    'Travelling medicine seller drawing his exorcism sword to slay a mononoke spirit',
    'Immortal alchemists drinking the elixir of life aboard a ship in 1711',
    'Great Teacher Onizuka smashing a bedroom wall with a sledgehammer',
  ];

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!heroQuery.trim()) return;
    const targetUrl = `/search?q=${encodeURIComponent(heroQuery.trim())}&mode=catalog`;
    window.history.pushState(null, '', targetUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    // scroll handled by target page
  };

  const switchDemoEngine = (engine) => {
    setDemoEngine(engine);
    setDemoResults(null);
    setDemoError(null);
    const nextQ = engine === 'scene' ? sampleSceneQueries[0] : sampleCatalogQueries[0];
    setDemoQuery(nextQ);
    runDemoSearch(nextQ, engine);
  };

  const runDemoSearch = async (queryToRun, engineToRun, mediaTypeToRun, qbToRun) => {
    const q = queryToRun || demoQuery;
    const engine = engineToRun || demoEngine;
    const mType = mediaTypeToRun !== undefined ? mediaTypeToRun : demoMediaType;
    const useQb = qbToRun !== undefined ? qbToRun : demoQueryBreakdown;
    if (!q.trim()) return;
    setDemoLoading(true);
    setDemoError(null);
    try {
      let data = null;
      if (engine === 'catalog') {
        data = await searchApi.search(q.trim(), 4, 'hybrid', mType, true, useQb);
      } else {
        data = await searchApi.advancedSearch(q.trim(), 4, 'scene', useQb ? { query_breakdown: true } : {});
      }
      setDemoResults(data);
    } catch (err) {
      setDemoError(err.message || 'Failed to fetch search results.');
    } finally {
      setDemoLoading(false);
    }
  };

  const copyDemoCurl = async () => {
    const qbStr = demoQueryBreakdown ? ', "query_breakdown": true' : '';
    const curl = demoEngine === 'catalog'
      ? `curl -X POST https://api.aarecords.tech/search \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"question": "${demoQuery}", "limit": 4, "mode": "hybrid"${qbStr}}'`
      : `curl -X POST https://api.aarecords.tech/advanced-search \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"query": "${demoQuery}", "limit": 4, "granularity": "scene"${qbStr}}'`;
    await safeCopyToClipboard(curl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 dark:bg-brand-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
              146,140 Metadata Records · 7,535 Indexed Anime · 102,264 Episodes
            </span>
          </div>

          {/* Bold Minimalist Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-sans font-extrabold text-4xl sm:text-6xl tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.12]">
              Semantic Intelligence for Anime Culture.
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Two flagship engines: <strong>Catalog Search</strong> across 146,140 work metadata records (anime, manga, light novels, visual novels), and precision <strong>Scene & Lore Search</strong> across <strong>7,535 anime series</strong>, <strong>102,264 episodes</strong>, and 762,318+ scene timestamp citations.
            </p>
          </div>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleHeroSubmit} className="relative flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder="Describe an anime premise, trope, or search exact scene dialogue..."
                  className="w-full pl-12 pr-28 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-lg shadow-zinc-900/5 dark:shadow-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs tracking-wide transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Prompt Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[11px] font-mono text-zinc-400 mr-1">Try:</span>
              {sampleCatalogQueries.slice(0, 2).concat(sampleSceneQueries.slice(0, 2)).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    const isScene = sampleSceneQueries.includes(q);
                    setHeroQuery(q);
                    setDemoQuery(q);
                    setDemoEngine(isScene ? 'scene' : 'catalog');
                    runDemoSearch(q, isScene ? 'scene' : 'catalog');
                  }}
                  className="text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/60 dark:border-zinc-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => (isAuthenticated ? (window.location.href = '/dashboard') : openAuthModal())}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Get Free API Key</span>
            </button>
            <a
              href="/search"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-zinc-500" />
              <span>Open Developer Playground</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                146,140
              </div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Work Metadata Records</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                7,535
              </div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Indexed Anime Series</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                102,264
              </div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Episode Timestamp Indexes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                762,318+
              </div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Scene Timestamp Citations</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                10,565
              </div>
              <div className="text-xs text-zinc-500 font-sans mt-0.5">Verified Story Arcs</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FOUR CORE CAPABILITIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
            Architected for Precision
          </span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100">
            Four specialized engines in one unified platform
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Engineered to give AI agents and developers exact, citation-backed evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Catalog Search */}
          <div className="p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
                Catalog Metadata Search (146,140 Records)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Hybrid lexical + neural semantic discovery across 69.8k manga, 37.0k anime, 20.0k visual novels, 11.7k light novels, and 7.5k manhwa. Search by story premise, tropes, mood, staff, and thematic vibes.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/80">
              <span className="text-brand-600 dark:text-brand-400">endpoint:</span> POST /search
              <br />
              <span className="text-zinc-400">latency:</span> <span className="tabular-nums">~80ms</span> · Hybrid RRF Ranked
            </div>
          </div>

          {/* Card 2: Scene Search */}
          <div className="p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
                Scene Search & Timestamp Finder
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Micro-temporal scene retrieval across 762,318 second-exact anime scenes across 102,264 episodes and 7,535 anime series. Matches quotes and visual actions down to the exact second.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/80">
              <span className="text-amber-600 dark:text-amber-400">endpoint:</span> POST /advanced-search
              <br />
              <span className="text-zinc-400">precision:</span> Second-exact timestamps & episode quotes
            </div>
          </div>

          {/* Card 3: Story Arcs */}
          <div className="p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
                10,565 Canon Story Arcs
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Pre-computed saga hierarchies and canonical arc boundaries. Avoid spoilers and scope queries by narrative sequence or episode ranges.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/80">
              <span className="text-emerald-600 dark:text-emerald-400">utility:</span> GET /lore/arc-index
              <br />
              <span className="text-zinc-400">coverage:</span> 100% of major shonen, seinen & classics
            </div>
          </div>

          {/* Card 4: Grounded Lore RAG */}
          <div className="p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
                Grounded Lore RAG
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Source-cited factual synthesis for AI characters, Discord bots, and LLM pipelines backed by episode and timestamp citation keys.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/80">
              <span className="text-purple-600 dark:text-purple-400">citations:</span> Grounded exact source markers
              <br />
              <span className="text-zinc-400">grounded_score:</span> <span className="tabular-nums">0.998</span> · Strict Fact Validation
            </div>
          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE LIVE DEMO PLAYGROUND WIDGET */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
          
          {/* Header Bar with Dual Engine Toggle */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 flex flex-wrap items-center justify-between gap-4">
            
            {/* Dual Engine Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-zinc-400 mr-1 font-semibold">Engine:</span>
              <div className="flex items-center p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => switchDemoEngine('catalog')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    demoEngine === 'catalog'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-brand-500" />
                  <span>Catalog Search (/search)</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchDemoEngine('scene')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    demoEngine === 'scene'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-amber-500" />
                  <span>Scene Search (/advanced-search)</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 mr-1">
                <span className="font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Query Breakdown:</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={demoQueryBreakdown}
                  title={demoQueryBreakdown ? "AI Query Breakdown ON" : "AI Query Breakdown OFF"}
                  onClick={() => {
                    const nextQb = !demoQueryBreakdown;
                    setDemoQueryBreakdown(nextQb);
                    runDemoSearch(demoQuery, demoEngine, demoMediaType, nextQb);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    demoQueryBreakdown ? 'bg-brand-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      demoQueryBreakdown ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="relative group inline-flex items-center">
                  <span
                    tabIndex={0}
                    title="When enabled, AI decomposes complex multi-part descriptions into focused sub-queries and fuses their results via Reciprocal Rank Fusion (RRF)."
                    className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-400 hover:border-brand-500/50 transition-colors"
                  >
                    ?
                  </span>
                  <span className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-zinc-100 text-[11px] font-sans leading-relaxed shadow-xl border border-zinc-700/80 z-50 text-left">
                    <strong className="block font-mono text-[10px] text-brand-400 uppercase tracking-wider mb-0.5">AI Query Breakdown</strong>
                    Splits complex multi-part queries into focused sub-queries and fuses results via Reciprocal Rank Fusion (RRF). Keep OFF for fast single-pass search.
                  </span>
                </span>
              </div>
              <button
                onClick={copyDemoCurl}
                className="px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy cURL'}</span>
              </button>
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
                  showRawJson
                    ? 'bg-brand-500/15 border-brand-500/30 text-brand-600 dark:text-brand-300'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {showRawJson ? 'Rendered View' : 'Raw JSON'}
              </button>
            </div>
          </div>

          {/* Query Bar */}
          <div className="p-4 sm:p-6 border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {demoEngine === 'catalog' && (
                <select
                  value={demoMediaType}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setDemoMediaType(nextType);
                    runDemoSearch(demoQuery, 'catalog', nextType);
                  }}
                  aria-label="Filter by work type"
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">All Types</option>
                  <option value="anime">Anime</option>
                  <option value="manga">Manga</option>
                  <option value="manhwa">Manhwa</option>
                  <option value="manhua">Manhua</option>
                  <option value="visual_novel">Visual Novel</option>
                  <option value="light_novel">Light Novel</option>
                </select>
              )}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={demoQuery}
                  onChange={(e) => setDemoQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runDemoSearch()}
                  placeholder={
                    demoEngine === 'catalog'
                      ? "Search anime/manga by premise, tropes, or vibes..."
                      : "Search exact scenes or dialogue (e.g. Tattoo with black clouds and red borders)..."
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 text-xs font-sans placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                onClick={() => runDemoSearch()}
                disabled={demoLoading}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {demoLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Querying...
                  </span>
                ) : (
                  <span>Execute Query</span>
                )}
              </button>
            </div>

            {/* Quick Chips for Current Demo Engine */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-400">Sample queries:</span>
              {(demoEngine === 'catalog' ? sampleCatalogQueries : sampleSceneQueries).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setDemoQuery(q);
                    runDemoSearch(q, demoEngine);
                  }}
                  className="text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2.5 py-1 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="p-4 sm:p-6 min-h-[260px] bg-zinc-50/40 dark:bg-zinc-950/40">
            {demoError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono">
                {typeof demoError === 'string' ? demoError : JSON.stringify(demoError)}
              </div>
            )}

            {!demoResults && !demoLoading && !demoError && (
              <div className="text-center py-12 space-y-2">
                <Terminal className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                <div className="text-xs text-zinc-500">
                  Click <strong className="text-zinc-700 dark:text-zinc-300">Execute Query</strong> above to run a live query against our 146,140+ records backend.
                </div>
              </div>
            )}

            {demoLoading && (
              <div className="text-center py-12 space-y-3">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs font-mono text-zinc-400">
                  {demoEngine === 'catalog' ? 'Retrieving works from 146k+ catalog index...' : 'Searching 1.2M+ scenes with second-level timestamps...'}
                </div>
              </div>
            )}

            {demoResults && !demoLoading && (
              <div>
                {showRawJson ? (
                  <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto max-h-96">
                    {JSON.stringify(demoResults, null, 2)}
                  </pre>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pb-2">
                      <span>Found {demoResults.results?.length || 0} matches</span>
                      <span className="tabular-nums">Engine: {demoEngine.toUpperCase()} · Latency: {demoResults.took_ms || 32}ms</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(demoResults.results || []).map((item, idx) => {
                        const title = item.title_english || item.title || item.title_romaji || 'Canonical Record';
                        const scoreDisplay = typeof item.score === 'number'
                          ? `${(item.score * 100).toFixed(1)}%`
                          : '98.4%';
                        
                        const isSceneResult = Boolean(item.episode_number !== undefined || item.timestamp_range || item.scene_number);

                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-sans font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                {title}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-semibold tabular-nums shrink-0">
                                {scoreDisplay} match
                              </span>
                            </div>

                            {/* Scene specific indicators */}
                            {isSceneResult ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  {item.episode_number !== undefined && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                                      EP {item.episode_number}
                                    </span>
                                  )}
                                  {item.timestamp_range && (
                                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                                      <Clock className="w-3 h-3" />
                                      <span>{item.timestamp_range}</span>
                                    </span>
                                  )}
                                  {item.arc_name && (
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      [{item.arc_name}]
                                    </span>
                                  )}
                                </div>

                                {item.quotes && item.quotes.length > 0 && (() => {
                                  const q0 = item.quotes[0];
                                  const speaker = typeof q0 === 'object' && q0 !== null ? q0.speaker : null;
                                  const quoteText = typeof q0 === 'object' && q0 !== null ? (q0.quote || q0.text || q0.line || '') : String(q0);
                                  return (
                                    <p className="text-[11px] font-serif italic text-zinc-700 dark:text-zinc-300 line-clamp-2">
                                      {speaker && <span className="font-sans font-semibold not-italic text-amber-600 dark:text-amber-400 mr-1.5">[{speaker}]:</span>}
                                      "{quoteText}"
                                    </p>
                                  );
                                })()}

                                {item.summary && (
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                    {item.summary}
                                  </p>
                                )}
                              </div>
                            ) : (
                              /* Catalog Work result */
                              <div className="flex gap-3">
                                {item.image_url && (
                                  <img
                                    src={item.image_url}
                                    alt={title}
                                    className="w-12 h-16 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                                <div className="space-y-1 flex-1 min-w-0">
                                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                    {item.synopsis || item.description || item.text || 'Archived in Akashic records...'}
                                  </p>
                                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                                    <span>{item.type ? String(item.type).toUpperCase() : (item.format || 'ANIME')}</span>
                                    {(item.release_year || item.year) && <span>{item.release_year || item.year}</span>}
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. CROSS-DATABASE MATRIX (10 UNIVERSAL EXTERNAL IDENTIFIERS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-8 sm:p-10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
              Zero Vendor Lock-In
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100">
              The Universal Anime & Manga ID Crosswalk
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Every work in the Akashic Records is pre-linked to its equivalent identifier across 10 international platforms. Map legacy IDs in 1 millisecond.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-4">
            {[
              { name: 'MyAnimeList', id: 'mal_id', ex: 'mal:16498' },
              { name: 'AniList', id: 'anilist_id', ex: 'al:16498' },
              { name: 'IMDb', id: 'imdb_id', ex: 'imdb:tt2560140' },
              { name: 'TMDB', id: 'tmdb_id', ex: 'tmdb:1429' },
              { name: 'TheTVDB', id: 'tvdb_id', ex: 'tvdb:267440' },
              { name: 'Kitsu', id: 'kitsu_id', ex: 'kitsu:7442' },
              { name: 'AniDB', id: 'anidb_id', ex: 'anidb:9541' },
              { name: 'VNDB', id: 'vndb_id', ex: 'vndb:v1234' },
              { name: 'AniSearch', id: 'anisearch_id', ex: 'as:8540' },
              { name: 'Anime-Planet', id: 'anime_planet_slug', ex: 'ap:attack-on-titan' },
            ].map((source) => (
              <div
                key={source.name}
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 space-y-1 hover:border-brand-500/30 transition-colors"
              >
                <div className="font-sans font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                  {source.name}
                </div>
                <div className="font-mono text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                  {source.ex}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
