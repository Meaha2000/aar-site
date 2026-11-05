import React, { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon,
  Film,
  GitBranch,
  BrainCircuit,
  Database,
  SlidersHorizontal,
  Copy,
  Check,
  Code2,
  ExternalLink,
  ChevronDown,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  Quote,
  Users,
  Tv,
  BookOpen,
  Book,
  Gamepad2,
  Calendar,
  Star,
  Compass,
  Zap,
  HelpCircle,
  FileText,
  MapPin,
  Tag,
  X,
  Plus,
  Minus,
  Trash2,
  Filter
} from 'lucide-react';
import { searchApi } from '../lib/api';
import { safeCopyToClipboard } from '../lib/utils';

// Safe helper to extract and render dialogue quotes with zero React object-child errors
function formatQuote(q) {
  if (!q) return null;
  if (typeof q === 'string') return { speaker: null, text: q };
  if (typeof q === 'object') {
    let text = q.quote || q.text || q.line || '';
    if (typeof text === 'object' && text !== null) {
      text = JSON.stringify(text);
    }
    let speaker = q.speaker || null;
    if (typeof speaker === 'object' && speaker !== null) {
      speaker = speaker.name || speaker.character || JSON.stringify(speaker);
    }
    return {
      speaker: speaker ? String(speaker) : null,
      evidence: q.speaker_evidence ? String(typeof q.speaker_evidence === 'object' ? JSON.stringify(q.speaker_evidence) : q.speaker_evidence) : null,
      text: text ? String(text) : JSON.stringify(q),
    };
  }
  return { speaker: null, text: String(q) };
}

// Safe WorkPoster component with media-specific icons and anti-hotlink bypass
function WorkPoster({ poster, title, type, format }) {
  const [failed, setFailed] = useState(false);
  const mediaType = String(format || type || '').toLowerCase();

  if (poster && !failed) {
    return (
      <img
        src={poster}
        alt={title}
        referrerPolicy="no-referrer"
        className="w-20 h-28 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs"
        onError={() => setFailed(true)}
      />
    );
  }

  let badgeLabel = 'ANIME';
  let badgeColor = 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20';
  let Icon = Film;

  if (mediaType.includes('visual_novel') || mediaType.includes('vn')) {
    badgeLabel = 'VISUAL NOVEL';
    badgeColor = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    Icon = Gamepad2;
  } else if (mediaType.includes('manga') || mediaType.includes('manhwa') || mediaType.includes('manhua')) {
    badgeLabel = 'MANGA';
    badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    Icon = BookOpen;
  } else if (mediaType.includes('novel')) {
    badgeLabel = 'LIGHT NOVEL';
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    Icon = Book;
  }

  return (
    <div className="w-20 h-28 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/70 shrink-0 flex flex-col items-center justify-center p-2 text-center select-none shadow-xs">
      <Icon className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-1.5" />
      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border leading-none ${badgeColor}`}>
        {badgeLabel}
      </span>
    </div>
  );
}

// Media type filter options for Catalog Suite (English as requested)
const MEDIA_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'anime', label: 'Anime' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa (Korean)' },
  { value: 'manhua', label: 'Manhua (Chinese)' },
  { value: 'visual_novel', label: 'Visual Novel' },
  { value: 'light_novel', label: 'Light Novel' },
];

export function Search() {
  // Two Flagship Suites:
  // 'catalog' = Anime Catalog Discovery (146,140 titles)
  // 'lore' = Advanced Scene & Lore Engine (762,318+ scenes across 102k+ episodes)
  const [suite, setSuite] = useState('catalog');

  // Sub-modes within suites:
  // In Catalog Suite: 'catalog_search' | 'catalog_recommend' | 'catalog_ask'
  // In Lore Suite: 'scene_search' | 'lore_recommend' | 'lore_ask'
  const [activeMode, setActiveMode] = useState('catalog_search');
  
  // Search parameters
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(8);
  const [searchMethod, setSearchMethod] = useState('hybrid'); // 'hybrid' | 'dense'
  const [granularity, setGranularity] = useState('scene'); // 'scene' | 'episode' | 'arc'
  const [mediaType, setMediaType] = useState('all'); // Media type filter (catalog only)
  const [adultFilter, setAdultFilter] = useState(true); // Default ON => sends adult: false
  
  // Multi-Seed & Negative Seed state for Catalog Recommend (+ and - up to 10 each)
  const [recommendSearchText, setRecommendSearchText] = useState('');
  const [positiveSeeds, setPositiveSeeds] = useState([]);
  const [negativeSeeds, setNegativeSeeds] = useState([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dedicated Lore Recommendations Studio State (Scene / Episode / Arc)
  const [loreWorkSearchText, setLoreWorkSearchText] = useState('');
  const [loreSelectedWork, setLoreSelectedWork] = useState(null);
  const [loreWorkSuggestions, setLoreWorkSuggestions] = useState([]);
  const [loreIsDropdownOpen, setLoreIsDropdownOpen] = useState(false);
  const [loreGranularity, setLoreGranularity] = useState('scene'); // 'scene' | 'episode' | 'arc'
  const [loreEpisodeNum, setLoreEpisodeNum] = useState('');
  const [loreSceneNum, setLoreSceneNum] = useState('');
  const [loreArcList, setLoreArcList] = useState([]);
  const [loreSelectedArcId, setLoreSelectedArcId] = useState('');
  const [loreDescriptivePrompt, setLoreDescriptivePrompt] = useState('');
  const [loreArcsLoading, setLoreArcsLoading] = useState(false);
  const loreDropdownRef = useRef(null);

  // Execution state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const resultsSectionRef = useRef(null);
  const [error, setError] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);

  // Seed Helpers for Catalog Recommend
  const addPositiveSeed = (anime) => {
    if (!anime) return;
    const id = anime.work_id || anime.canonical_id || anime.aar_id || anime.mal_id || String(anime.id || anime.title || '');
    if (!id) return;
    if (positiveSeeds.length >= 10) return;
    if (positiveSeeds.some(s => s.id === id)) return;
    setNegativeSeeds(prev => prev.filter(s => s.id !== id));
    const newSeed = {
      id,
      title: anime.title_english || anime.title || anime.title_canonical || 'Anime Work',
      image_url: anime.image_url || anime.images?.jpg?.image_url || null,
      year: anime.release_year || anime.year || null,
      type: anime.type || anime.format || 'ANIME'
    };
    setPositiveSeeds(prev => [...prev, newSeed]);
    setRecommendSearchText('');
    setIsDropdownOpen(false);
  };

  const addNegativeSeed = (anime) => {
    if (!anime) return;
    const id = anime.work_id || anime.canonical_id || anime.aar_id || anime.mal_id || String(anime.id || anime.title || '');
    if (!id) return;
    if (negativeSeeds.length >= 10) return;
    if (negativeSeeds.some(s => s.id === id)) return;
    setPositiveSeeds(prev => prev.filter(s => s.id !== id));
    const newSeed = {
      id,
      title: anime.title_english || anime.title || anime.title_canonical || 'Anime Work',
      image_url: anime.image_url || anime.images?.jpg?.image_url || null,
      year: anime.release_year || anime.year || null,
      type: anime.type || anime.format || 'ANIME'
    };
    setNegativeSeeds(prev => [...prev, newSeed]);
    setRecommendSearchText('');
    setIsDropdownOpen(false);
  };

  const removePositiveSeed = (id) => {
    setPositiveSeeds(prev => prev.filter(s => s.id !== id));
  };

  const removeNegativeSeed = (id) => {
    setNegativeSeeds(prev => prev.filter(s => s.id !== id));
  };

  // Sample presets tailored for each engine
  const samplePresets = {
    catalog_search: [
      'Children pilot a giant robot powered by their own life force where the pilot dies after every battle',
      'Girl wakes up in a walled town with a halo and sprouts grey wings from a cocoon with no memories',
      'Travelling medicine seller exorcises supernatural spirits after uncovering their form truth and reason',
      'Lonely girl connects to a virtual network called the Wired after a classmate sends emails after dying'
    ],
    scene_search: [
      'Children inside a giant robot cockpit learning the pilot will die after the battle',
      'Travelling medicine seller drawing his exorcism sword to slay a mononoke spirit',
      'Great Teacher Onizuka smashing a bedroom wall with a sledgehammer',
      'Immortal alchemists drinking the elixir of life aboard a ship in 1711',
      'Goku turns Super Saiyan against Frieza'
    ],
    catalog_recommend: [
      { id: 'work:anime:mal_16498_al_16498', label: 'Attack on Titan', year: 2013, img: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg', type: 'anime' },
      { id: 'work:anime:mal_9253_al_9253', label: 'Steins;Gate', year: 2011, img: 'https://cdn.myanimelist.net/images/anime/5/73199.jpg', type: 'anime' },
      { id: 'work:anime:mal_1_al_1', label: 'Cowboy Bebop', year: 1998, img: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg', type: 'anime' },
      { id: 'work:anime:mal_1535_al_1535', label: 'Death Note', year: 2006, img: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg', type: 'anime' }
    ],
    lore_recommend: [
      'Mind game cat-and-mouse duel between detective and vigilante',
      'Psychological breakdown during mecha synchronization test',
      'Philosophical AI question of what defines a human soul'
    ],
    catalog_ask: [
      'Which dark sci-fi anime is about children piloting a giant robot powered by their own life force where the pilot dies after every battle?',
      'What is the anime where a girl wakes up in a walled town, sprouts grey wings from a cocoon, and has no memories?',
      'Which mystery anime follows a travelling medicine seller who must uncover a spirit’s Form, Truth, and Reason before drawing his sword?',
      'Which late-90s sci-fi anime is specifically about teenagers stranded aboard a spaceship after their training station is sabotaged?'
    ],
    lore_ask: [
      'In Bokurano, how do the children inside the cockpit discover that piloting Zearth costs the pilot their life?',
      'In Mononoke, what truth does the Medicine Seller uncover before drawing his sword to exorcise the spirit?',
      'In Baccano!, what happens aboard the Advena Avis ship in 1711 when the alchemists drink the immortality elixir?',
      'In Great Teacher Onizuka, why does Onizuka smash his student bedroom wall with a sledgehammer?'
    ]
  };

  // Debounced Autocomplete for Recommend
  useEffect(() => {
    if (activeMode !== 'catalog_recommend') return;
    if (!recommendSearchText || recommendSearchText.trim().length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAutocompleteLoading(true);
      try {
        const res = await searchApi.autocomplete(recommendSearchText.trim());
        setAutocompleteSuggestions(res.results || []);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('Autocomplete query failed:', err);
      } finally {
        setIsAutocompleteLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [recommendSearchText, activeMode]);

  // Debounced Autocomplete for Lore Anchor Work
  useEffect(() => {
    if (!['lore_recommend', 'scene_search', 'lore_ask'].includes(activeMode)) return;
    if (!loreWorkSearchText || loreWorkSearchText.trim().length < 2) {
      setLoreWorkSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.autocomplete(loreWorkSearchText.trim());
        setLoreWorkSuggestions(res.results || []);
        setLoreIsDropdownOpen(true);
      } catch (err) {
        console.error('Lore work autocomplete failed:', err);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [loreWorkSearchText, activeMode]);

  // Load Arcs when Lore Selected Work changes or when Lore Granularity is arc
  useEffect(() => {
    if (activeMode === 'lore_recommend' && loreSelectedWork && loreGranularity === 'arc') {
      const wId = loreSelectedWork.work_id || loreSelectedWork.canonical_id || loreSelectedWork.id;
      setLoreArcsLoading(true);
      searchApi.getWorkArcs(wId)
        .then((res) => {
          const arcs = res.arcs || [];
          setLoreArcList(arcs);
          if (arcs.length > 0) {
            setLoreSelectedArcId(arcs[0].arc_id);
          }
        })
        .catch((err) => {
          console.error('Failed to load work arcs:', err);
          setLoreArcList([]);
        })
        .finally(() => setLoreArcsLoading(false));
    }
  }, [activeMode, loreSelectedWork, loreGranularity]);

  // Click outside listener for autocomplete dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (loreDropdownRef.current && !loreDropdownRef.current.contains(e.target)) {
        setLoreIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAnime = (anime) => {
    addPositiveSeed(anime);
    const seedId = anime.work_id || anime.canonical_id || anime.aar_id || anime.mal_id || String(anime.id || '');
    executeSearch([seedId], 'catalog_recommend');
  };

  // Switch between Flagship Suites without auto-executing search
  const switchSuite = (targetSuite) => {
    setSuite(targetSuite);
    setResults(null);
    setError(null);
    setIsDropdownOpen(false);
    setQuery(''); // Leave search box empty for the user to try

    if (targetSuite === 'catalog') {
      setActiveMode('catalog_search');
    } else {
      setActiveMode('scene_search');
    }
  };

  // Switch sub-mode within suite without auto-executing search
  const switchMode = (newMode) => {
    setActiveMode(newMode);
    setResults(null);
    setError(null);
    setIsDropdownOpen(false);
    setQuery(''); // Leave search box empty for the user to try
  };

  // Sync with URL params on mount and when popstate occurs
  useEffect(() => {
    const handleUrlSync = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const modeParam = params.get('mode');

      let targetSuite = 'catalog';
      let targetMode = 'catalog_search';

      if (modeParam === 'scene' || modeParam === 'scene_search') {
        targetSuite = 'lore';
        targetMode = 'scene_search';
      } else if (modeParam === 'lore_ask') {
        targetSuite = 'lore';
        targetMode = 'lore_ask';
      } else if (modeParam === 'ask' || modeParam === 'catalog_ask') {
        targetSuite = 'catalog';
        targetMode = 'catalog_ask';
      } else if (modeParam === 'recommend' || modeParam === 'catalog_recommend') {
        targetSuite = 'catalog';
        targetMode = 'catalog_recommend';
      } else {
        targetSuite = 'catalog';
        targetMode = 'catalog_search';
      }

      setSuite(targetSuite);
      setActiveMode(targetMode);

      // Only run if user explicitly navigated with a non-empty ?q= query
      if (q && q.trim()) {
        setQuery(q.trim());
        executeSearch(q.trim(), targetMode);
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, []);

  const executeSearch = async (overrideQuery, overrideMode) => {
    const targetMode = overrideMode || activeMode;
    const targetQuery = overrideQuery !== undefined ? overrideQuery : query;

    if (targetMode === 'catalog_recommend') {
      const posIds = positiveSeeds.length > 0
        ? positiveSeeds.map(s => s.id)
        : (Array.isArray(targetQuery) ? targetQuery : (targetQuery ? [targetQuery] : (recommendSearchText.trim() ? [recommendSearchText.trim()] : [])));
      if (posIds.length === 0) return;
    } else if (targetMode === 'lore_recommend') {
      if (!loreSelectedWork && !loreWorkSearchText.trim() && !targetQuery?.trim?.() && !loreDescriptivePrompt.trim()) return;
    } else {
      if (!targetQuery || !targetQuery.trim()) return;
    }

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      let data = null;
      if (targetMode === 'catalog_search') {
        data = await searchApi.search(targetQuery.trim(), limit, searchMethod, mediaType, adultFilter);
      } else if (targetMode === 'scene_search') {
        const scopeFilters = {};
        let workObj = loreSelectedWork;
        if (!workObj && loreWorkSearchText.trim().length >= 2) {
          try {
            const ac = await searchApi.autocomplete(loreWorkSearchText.trim());
            const firstHit = (ac?.results || [])[0];
            if (firstHit) {
              workObj = firstHit;
              setLoreSelectedWork(firstHit);
            }
          } catch (_) {}
        }
        if (workObj) {
          const wId = workObj.work_id || workObj.canonical_id || workObj.id;
          if (wId) scopeFilters.work_id = wId;
          if (workObj.mal_id) scopeFilters.mal_id = Number(workObj.mal_id);
          if (workObj.anilist_id) scopeFilters.anilist_id = Number(workObj.anilist_id);
        }
        if (loreEpisodeNum && String(loreEpisodeNum).trim() !== '') {
          scopeFilters.episode_number = Number(loreEpisodeNum);
        }
        data = await searchApi.advancedSearch(targetQuery.trim(), limit, granularity, scopeFilters);
      } else if (targetMode === 'catalog_recommend') {
        let posIds = positiveSeeds.map(s => s.id);
        if (posIds.length === 0) {
          if (Array.isArray(targetQuery) && targetQuery.length > 0) {
            posIds = targetQuery;
          } else if (typeof targetQuery === 'string' && targetQuery.trim()) {
            posIds = [targetQuery.trim()];
          } else if (recommendSearchText.trim()) {
            posIds = [recommendSearchText.trim()];
          }
        }
        const negIds = negativeSeeds.map(s => s.id);
        data = await searchApi.recommend(posIds, limit, negIds, mediaType, adultFilter);
      } else if (targetMode === 'lore_recommend') {
        let activeWork = loreSelectedWork;
        if (!activeWork && loreWorkSearchText.trim()) {
          if (loreWorkSuggestions && loreWorkSuggestions.length > 0) {
            activeWork = loreWorkSuggestions[0];
            setLoreSelectedWork(activeWork);
          } else {
            try {
              const ac = await searchApi.autocomplete(loreWorkSearchText.trim());
              const list = Array.isArray(ac) ? ac : (ac?.results || ac?.suggestions || []);
              if (list.length > 0) {
                activeWork = list[0];
                setLoreSelectedWork(activeWork);
              }
            } catch (_) {}
          }
        }

        if (activeWork) {
          const wId = activeWork.work_id || activeWork.canonical_id || activeWork.id;
          const posObj = { work_id: wId };
          if (activeWork.mal_id) posObj.mal_id = Number(activeWork.mal_id);
          if (activeWork.anilist_id) posObj.anilist_id = Number(activeWork.anilist_id);

          let effectiveGranularity = loreGranularity || 'scene';
          if (effectiveGranularity === 'scene') {
            posObj.episode_number = Number(loreEpisodeNum) || 1;
            if (loreSceneNum) {
              posObj.scene_number = Number(loreSceneNum);
            } else {
              posObj.scene_number = 1;
            }
          } else if (effectiveGranularity === 'episode') {
            posObj.episode_number = Number(loreEpisodeNum) || 1;
          } else if (effectiveGranularity === 'arc') {
            if (loreSelectedArcId) posObj.arc_id = loreSelectedArcId;
          }

          const options = {
            granularity: effectiveGranularity,
            positive_ids: [posObj],
            limit,
          };
          if (loreDescriptivePrompt.trim()) {
            options.positive_queries = [loreDescriptivePrompt.trim()];
          }

          try {
            data = await searchApi.advancedRecommend(options);
          } catch (recErr) {
            // Fallback 1: if scene_number=1 wasn't found or episode level works better, try without scene_number or with episode granularity
            try {
              const epPosObj = { work_id: wId, episode_number: Number(loreEpisodeNum) || 1 };
              if (activeWork.mal_id) epPosObj.mal_id = Number(activeWork.mal_id);
              data = await searchApi.advancedRecommend({
                granularity: 'episode',
                positive_ids: [epPosObj],
                positive_queries: loreDescriptivePrompt.trim() ? [loreDescriptivePrompt.trim()] : undefined,
                limit,
              });
            } catch (_) {
              // Fallback 2: semantic query fallback using work title + episode + descriptive prompt
              const workName = activeWork.title_english || activeWork.title || loreWorkSearchText.trim();
              const fbPrompt = [workName, loreEpisodeNum ? `Episode ${loreEpisodeNum}` : '', loreDescriptivePrompt.trim()].filter(Boolean).join(' - ');
              data = await searchApi.advancedRecommend(fbPrompt, limit, loreGranularity || 'scene');
            }
          }
        } else {
          const prompt = (typeof targetQuery === 'string' && targetQuery.trim())
            ? targetQuery.trim()
            : (loreDescriptivePrompt.trim() || loreWorkSearchText.trim() || query.trim());
          data = await searchApi.advancedRecommend(prompt, limit, loreGranularity || granularity);
        }
      } else if (targetMode === 'catalog_ask') {
        data = await searchApi.ask(targetQuery.trim(), limit, mediaType, adultFilter);
      } else if (targetMode === 'lore_ask') {
        const scopeFilters = {};
        let workObj = loreSelectedWork;
        if (!workObj && loreWorkSearchText.trim().length >= 2) {
          try {
            const ac = await searchApi.autocomplete(loreWorkSearchText.trim());
            const firstHit = (ac?.results || [])[0];
            if (firstHit) {
              workObj = firstHit;
              setLoreSelectedWork(firstHit);
            }
          } catch (_) {}
        }
        if (workObj) {
          const wId = workObj.work_id || workObj.canonical_id || workObj.id;
          if (wId) scopeFilters.work_id = wId;
          if (workObj.mal_id) scopeFilters.mal_id = Number(workObj.mal_id);
          if (workObj.anilist_id) scopeFilters.anilist_id = Number(workObj.anilist_id);
        }
        if (loreEpisodeNum && String(loreEpisodeNum).trim() !== '') {
          scopeFilters.episode_number = Number(loreEpisodeNum);
        }
        data = await searchApi.loreAsk(targetQuery.trim(), limit, granularity, scopeFilters);
      }
      setLatencyMs(Math.round(performance.now() - startTime));
      setResults(data);
    } catch (err) {
      setError(err.message || 'Error occurred while querying API.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (activeMode === 'catalog_recommend') {
      if (positiveSeeds.length === 0 && autocompleteSuggestions.length > 0) {
        addPositiveSeed(autocompleteSuggestions[0]);
        return;
      }
      if (positiveSeeds.length === 0 && recommendSearchText.trim()) {
        executeSearch([recommendSearchText.trim()], 'catalog_recommend');
        return;
      }
      setIsDropdownOpen(false);
      executeSearch();
    } else if (activeMode === 'lore_recommend') {
      executeSearch();
    } else {
      executeSearch();
    }
  };

  const copyCurrentCurl = async () => {
    let curl = '';
    if (activeMode === 'catalog_search') {
      const scopePart = mediaType !== 'all' ? `, "scope": {"types": ["${mediaType}"]}` : '';
      curl = `curl -X POST https://api.aarecords.tech/search \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"question": "${query}", "limit": ${limit}, "mode": "${searchMethod}"${scopePart}}'`;
    } else if (activeMode === 'scene_search') {
      curl = `curl -X POST https://api.aarecords.tech/advanced-search \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"query": "${query}", "limit": ${limit}, "granularity": "${granularity}"}'`;
    } else if (activeMode === 'catalog_recommend') {
      const posIds = positiveSeeds.map(s => `"${s.id}"`).join(', ');
      const negIds = negativeSeeds.map(s => `"${s.id}"`).join(', ');
      const scopePart = mediaType !== 'all' ? `, "target_scope": "${mediaType}"` : '';
      curl = `curl -X POST https://api.aarecords.tech/recommend \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"seed_work_ids": [${posIds}], "negative_work_ids": [${negIds}], "limit": ${limit}${scopePart}}'`;
    } else if (activeMode === 'lore_recommend') {
      if (loreSelectedWork) {
        const wId = loreSelectedWork.work_id || loreSelectedWork.canonical_id || loreSelectedWork.id;
        const posObj = { work_id: wId };
        if (loreGranularity === 'scene') {
          if (loreEpisodeNum) posObj.episode_number = Number(loreEpisodeNum);
          if (loreSceneNum) posObj.scene_number = Number(loreSceneNum);
        } else if (loreGranularity === 'episode') {
          if (loreEpisodeNum) posObj.episode_number = Number(loreEpisodeNum);
        } else if (loreGranularity === 'arc') {
          if (loreSelectedArcId) posObj.arc_id = loreSelectedArcId;
        }
        curl = `curl -X POST https://api.aarecords.tech/advanced-recommend \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"positive_ids": [${JSON.stringify(posObj)}], "limit": ${limit}, "granularity": "${loreGranularity}"}'`;
      } else {
        curl = `curl -X POST https://api.aarecords.tech/advanced-recommend \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"positive_queries": ["${query || loreDescriptivePrompt}"], "limit": ${limit}, "granularity": "${loreGranularity}"}'`;
      }
    } else if (activeMode === 'catalog_ask') {
      const scopePart = mediaType !== 'all' ? `, "scope": {"types": ["${mediaType}"]}` : '';
      curl = `curl -X POST https://api.aarecords.tech/ask \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"question": "${query}", "limit": ${limit}${scopePart}}'`;
    } else if (activeMode === 'lore_ask') {
      curl = `curl -X POST https://api.aarecords.tech/lore-ask \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{"query": "${query}", "limit": ${limit}, "granularity": "${granularity}"}'`;
    }

    await safeCopyToClipboard(curl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-zinc-900 dark:text-white">
            Interactive Search & Discovery Explorer
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Choose between <strong>Anime Catalog Discovery</strong> (146,140 works) or the temporal <strong>Advanced Scene & Lore Engine</strong> (<strong>7,535 anime series</strong> · <strong>102,264 episodes</strong> · 762,318+ indexed scene timestamp citations).
          </p>
        </div>

        {/* Global Playground Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCurrentCurl}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center gap-2 transition shadow-sm"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'cURL Copied' : 'Copy cURL'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono border transition shadow-sm flex items-center gap-2 ${
              showRawJson
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>
        </div>
      </div>

      {/* TOP-LEVEL SUITE SELECTOR (2 Clean Flagship Divisions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Suite 1: Anime Catalog Discovery */}
        <button
          type="button"
          onClick={() => switchSuite('catalog')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            suite === 'catalog'
              ? 'border-brand-500/60 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500/20 shadow-md'
              : 'border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${suite === 'catalog' ? 'bg-brand-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Anime Catalog Discovery
                </h3>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  146,140 Titles · Works, External IDs & AI Answers
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20">
              CATALOG SUITE
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Fast semantic title search, multi-seed graph recommendations, sequel suppression, and catalog AI answer synthesis.
          </p>
        </button>

        {/* Suite 2: Advanced Scene & Lore Engine */}
        <button
          type="button"
          onClick={() => switchSuite('lore')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            suite === 'lore'
              ? 'border-amber-500/60 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20 shadow-md'
              : 'border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${suite === 'lore' ? 'bg-amber-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Advanced Scene & Lore Engine
                </h3>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  7,535 Anime · 102,264 Episodes · 762k+ Scenes
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
              ADVANCED SUITE
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Micro-temporal scene retrieval, second-exact timestamps, speaker-identified dialogue quotes, and deep lore RAG citations.
          </p>
        </button>
      </div>

      {/* SUB-MODE TABS ACCORDING TO SELECTED SUITE */}
      <div className="w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 overflow-x-auto tabs-scrollbar scroll-smooth flex-nowrap touch-pan-x">
        {suite === 'catalog' ? (
          <>
            <button
              type="button"
              onClick={() => switchMode('catalog_search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeMode === 'catalog_search'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <SearchIcon className="w-3.5 h-3.5 text-brand-500" />
              <span>Catalog Search</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('catalog_recommend')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeMode === 'catalog_recommend'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
              <span>Work Recommendations</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('catalog_ask')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeMode === 'catalog_ask'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI Answer Layer</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => switchMode('scene_search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeMode === 'scene_search'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-amber-500" />
              <span>Scene Search</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('lore_recommend')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeMode === 'lore_recommend'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span>Contextual Recommendations</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('lore_ask')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                activeMode === 'lore_ask'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Deep Lore RAG (Exact Citations)</span>
            </button>
          </>
        )}
        </div>
      </div>

      {/* Mode-Specific Guidance Banner: LLM Reasoning in Ask Tabs vs Pure Vector Retrieval in Others */}
      {activeMode === 'catalog_ask' ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed">
          <BrainCircuit className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center flex-wrap gap-2">
              <span>Real LLM Candidate Reasoning & Synopsis Comparison</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                LLM-Powered (/ask)
              </span>
            </div>
            <p className="text-emerald-900/80 dark:text-emerald-300/80">
              Unlike the pure vector search tabs, this mode runs a <strong>real Large Language Model (LLM)</strong> over the retrieved catalog synopses. Because the Catalog DB stores plot summaries and metadata (not deep episode lore), this engine excels at <strong>comparing your question against all candidate works</strong>—accurately identifying and verifying the right title even when it ranks below the top 3 vector hits.
            </p>
          </div>
        </div>
      ) : activeMode === 'lore_ask' ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed">
          <BrainCircuit className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center flex-wrap gap-2">
              <span>Real LLM Scene & Lore RAG Synthesis</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                LLM-Powered (/lore-ask)
              </span>
            </div>
            <p className="text-emerald-900/80 dark:text-emerald-300/80">
              Unlike the pure vector scene search tabs, this mode runs a <strong>real Large Language Model (LLM)</strong> over the retrieved scene, episode, and arc evidence across 7,535 indexed anime profiles, 102,264 episodes, and 762,318 scene records. It <strong>compares your question against all candidate scenes and dialogue quotes</strong> to pinpoint the exact event, verify what happened, and synthesize a grounded answer with episode and timestamp citations—even when the exact scene ranks below the top vector hits.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 text-xs leading-relaxed">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <span>Semantic Descriptive Search Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                Not a Chatbot
              </span>
            </div>
            <p className="text-amber-900/80 dark:text-amber-300/80">
              AAR is a deterministic semantic retrieval engine, not a conversational chatbot. For optimal precision, please search using descriptive plot premises, story tropes, visual scene actions, or memorable quotes (e.g. <em>"Children pilot a giant robot powered by their own life force where the pilot dies after every battle"</em> or <em>"Rooftop battle during heavy rain with thunder"</em>) rather than conversational greetings or questions.
            </p>
          </div>
        </div>
      )}

      {/* SEARCH QUERY INPUT BOX & CONTROLS */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-sm space-y-4 shadow-sm">
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Main Input Row: Catalog Recommend Multi-Seed vs Lore Recommend Studio vs Standard Query */}
          {activeMode === 'catalog_recommend' ? (
            <div className="space-y-3" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                  Search & Add Recommendation Seeds (Up to 10 Positive & 10 Negative):
                </label>
                <span className="text-[11px] font-mono text-zinc-400">
                  <span className="text-emerald-500 font-bold">+</span> Seeds steer toward · <span className="text-rose-500 font-bold">-</span> Seeds steer away
                </span>
              </div>

              {/* Autocomplete Input Container */}
              <div className="relative">
                <div className="relative flex items-center">
                  <SearchIcon className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={recommendSearchText}
                    onChange={(e) => {
                      setRecommendSearchText(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (autocompleteSuggestions.length > 0) setIsDropdownOpen(true);
                    }}
                    placeholder="Type anime title (e.g. Attack on Titan, Steins;Gate, Cowboy Bebop, Death Note)..."
                    className="w-full pl-12 pr-32 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-zinc-400"
                  />
                  <button
                    type="submit"
                    disabled={loading || (positiveSeeds.length === 0 && !recommendSearchText.trim())}
                    className="absolute right-2 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <span>Find Similar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Floating Autocomplete Dropdown */}
                {isDropdownOpen && autocompleteSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                    {autocompleteSuggestions.map((item, idx) => {
                      const poster = item.image_url;
                      const title = item.title_english || item.title || item.title_canonical || 'Anime Work';
                      return (
                        <div
                          key={idx}
                          className="w-full p-3 flex items-center gap-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition text-left"
                        >
                          {poster ? (
                            <img
                              src={poster}
                              alt={title}
                              className="w-10 h-14 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-400">
                              <Tv className="w-4 h-4" />
                            </div>
                          )}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleSelectAnime(item)}
                          >
                            <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                              {title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-zinc-500">
                              {item.release_year && <span>{item.release_year}</span>}
                              {item.format && <span className="uppercase">· {item.format}</span>}
                              {item.score && (
                                <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  {typeof item.score === 'number' ? item.score.toFixed(1) : item.score}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Add Seeds Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addPositiveSeed(item);
                              }}
                              disabled={positiveSeeds.length >= 10}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition disabled:opacity-40"
                              title="Add to positive seeds"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Seed</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addNegativeSeed(item);
                              }}
                              disabled={negativeSeeds.length >= 10}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition disabled:opacity-40"
                              title="Add to negative seeds (avoid)"
                            >
                              <Minus className="w-3.5 h-3.5" />
                              <span>Avoid</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Multi-Seed Badges Display */}
              {(positiveSeeds.length > 0 || negativeSeeds.length > 0) && (
                <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2.5">
                  
                  {/* Positive Seeds */}
                  {positiveSeeds.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Positive Seeds ({positiveSeeds.length}/10):</span>
                        </span>
                        <span className="text-zinc-400 text-[10px]">Shapes recommendation trajectory</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {positiveSeeds.map((seed) => (
                          <span
                            key={seed.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          >
                            <span className="font-bold text-emerald-500">+</span>
                            <span className="truncate max-w-[200px]">{seed.title}</span>
                            <button
                              type="button"
                              onClick={() => removePositiveSeed(seed.id)}
                              className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negative Seeds */}
                  {negativeSeeds.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                          <Minus className="w-3.5 h-3.5" />
                          <span>Negative Seeds ({negativeSeeds.length}/10):</span>
                        </span>
                        <span className="text-zinc-400 text-[10px]">Steers vector away from these tropes</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {negativeSeeds.map((seed) => (
                          <span
                            key={seed.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                          >
                            <span className="font-bold text-rose-500">-</span>
                            <span className="truncate max-w-[200px]">{seed.title}</span>
                            <button
                              type="button"
                              onClick={() => removeNegativeSeed(seed.id)}
                              className="p-0.5 rounded hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear All Seeds */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPositiveSeeds([]);
                        setNegativeSeeds([]);
                      }}
                      className="text-[11px] font-mono text-zinc-400 hover:text-red-500 flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All Seeds</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeMode === 'lore_recommend' ? (
            /* Dedicated Lore Recommendations Studio (Scene / Episode / Arc) */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Advanced Contextual Recommendation Studio
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Scene · Episode · Story Arc Level
                  </span>
                </div>
                {loreSelectedWork && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoreSelectedWork(null);
                      setLoreWorkSearchText('');
                      setLoreArcList([]);
                      setLoreSelectedArcId('');
                    }}
                    className="text-[11px] font-mono text-zinc-400 hover:text-red-500 flex items-center gap-1 transition"
                  >
                    <X className="w-3 h-3" />
                    <span>Reset Anchor</span>
                  </button>
                )}
              </div>

              {/* Step 1: Select Anchor Anime Work */}
              <div className="space-y-1.5" ref={loreDropdownRef}>
                <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                  1. Select Anchor Anime Work:
                </label>
                
                {loreSelectedWork ? (
                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {loreSelectedWork.image_url ? (
                        <img
                          src={loreSelectedWork.image_url}
                          alt={loreSelectedWork.title}
                          className="w-10 h-14 object-cover rounded-lg shrink-0 border border-zinc-200 dark:border-zinc-700"
                        />
                      ) : (
                        <div className="w-10 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-400">
                          <Tv className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold block">
                          Selected Anchor Anime
                        </span>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {loreSelectedWork.title_english || loreSelectedWork.title || loreSelectedWork.title_canonical}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400">
                          ID: {loreSelectedWork.work_id || loreSelectedWork.canonical_id || loreSelectedWork.id}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoreSelectedWork(null);
                        setLoreWorkSearchText('');
                        setLoreArcList([]);
                        setLoreSelectedArcId('');
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                      title="Change anchor work"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative flex items-center">
                      <SearchIcon className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
                      <input
                        type="text"
                        value={loreWorkSearchText}
                        onChange={(e) => {
                          setLoreWorkSearchText(e.target.value);
                          setLoreIsDropdownOpen(true);
                        }}
                        onFocus={() => {
                          if (loreWorkSuggestions.length > 0) setLoreIsDropdownOpen(true);
                        }}
                        placeholder="Search anime to anchor recommendations (e.g. Steins;Gate, Attack on Titan, Psycho-Pass)..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-400"
                      />
                    </div>

                    {/* Autocomplete Dropdown */}
                    {loreIsDropdownOpen && loreWorkSuggestions.length > 0 && (
                      <div className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                        {loreWorkSuggestions.map((item, idx) => {
                          const poster = item.image_url;
                          const title = item.title_english || item.title || item.title_canonical || 'Anime Work';
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setLoreSelectedWork(item);
                                setLoreWorkSearchText(title);
                                setLoreIsDropdownOpen(false);
                              }}
                              className="w-full p-3 flex items-center gap-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition text-left"
                            >
                              {poster ? (
                                <img
                                  src={poster}
                                  alt={title}
                                  className="w-10 h-14 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-10 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-400">
                                  <Tv className="w-4 h-4" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                  {title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-zinc-500">
                                  {item.release_year && <span>{item.release_year}</span>}
                                  {item.format && <span className="uppercase">· {item.format}</span>}
                                  {item.score && (
                                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                      <Star className="w-3 h-3 fill-amber-500" />
                                      {typeof item.score === 'number' ? item.score.toFixed(1) : item.score}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                                Select Anchor
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Choose Recommendation Scope (Scene / Episode / Story Arc) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                  2. Contextual Scope & Recommendation Unit:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoreGranularity('scene')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      loreGranularity === 'scene'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold">Scene Level</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">
                      Micro-moments & exact timestamps
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoreGranularity('episode')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      loreGranularity === 'episode'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="text-xs font-bold">Episode Level</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">
                      Full 24-min narrative units
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoreGranularity('arc')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      loreGranularity === 'arc'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="text-xs font-bold">Story Arc Level</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">
                      Multi-episode sagas & climaxes
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3: Granularity Sub-Parameters */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    3. Granularity Targeting ({loreGranularity.toUpperCase()}):
                  </span>
                </div>

                {loreGranularity === 'scene' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                        Episode Number (e.g. 1):
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={loreEpisodeNum}
                        onChange={(e) => setLoreEpisodeNum(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                        Scene Number (optional):
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={loreSceneNum}
                        onChange={(e) => setLoreSceneNum(e.target.value)}
                        placeholder="e.g. 5 (leave blank for top scenes)"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {loreGranularity === 'episode' && (
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                      Episode Number (e.g. 1):
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={loreEpisodeNum}
                      onChange={(e) => setLoreEpisodeNum(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full sm:w-1/2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                )}

                {loreGranularity === 'arc' && (
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                      Select Story Arc:
                    </label>
                    {loreArcsLoading ? (
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 py-2">
                        <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span>Loading registered story arcs...</span>
                      </div>
                    ) : loreArcList.length > 0 ? (
                      <select
                        value={loreSelectedArcId}
                        onChange={(e) => setLoreSelectedArcId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        {loreArcList.map((arc) => (
                          <option key={arc.arc_id} value={arc.arc_id}>
                            {arc.arc_name} (Ep {arc.start_episode}-{arc.end_episode}) · {arc.episodes_count || 1} eps
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic py-1">
                        {loreSelectedWork
                          ? 'No segmented story arcs found for this specific title. Using episode/scene granularity is recommended.'
                          : 'Select an anchor anime above to view its registered story arcs.'}
                      </p>
                    )}
                  </div>
                )}

                {/* Guiding / Nuance Prompt */}
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                    Thematic Nuance / Guiding Prompt (Optional):
                  </label>
                  <input
                    type="text"
                    value={loreDescriptivePrompt}
                    onChange={(e) => setLoreDescriptivePrompt(e.target.value)}
                    placeholder="e.g. Philosophical betrayal, intense rooftop duel during rain, or moral dilemma..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => executeSearch()}
                    disabled={loading || (!loreSelectedWork && !loreWorkSearchText.trim() && !loreDescriptivePrompt.trim())}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing Lore Vectors...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5" />
                        <span>Run Contextual Recommendations</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Query Bar for Other Modes */
            <div className="space-y-3">
              {(activeMode === 'scene_search' || activeMode === 'lore_ask') && (
                <div className="p-3 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-purple-500" />
                      <span>Filter by Specific Anime (Optional — leave empty to search all 7,535 anime):</span>
                    </span>
                    {(loreSelectedWork || loreEpisodeNum) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoreSelectedWork(null);
                          setLoreWorkSearchText('');
                          setLoreEpisodeNum('');
                        }}
                        className="text-[11px] font-mono text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear Anime Filter</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                    <div className="sm:col-span-2 relative" ref={loreDropdownRef}>
                      {loreSelectedWork ? (
                        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {loreSelectedWork.image_url && (
                              <img
                                src={loreSelectedWork.image_url}
                                alt=""
                                className="w-6 h-8 object-cover rounded shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {loreSelectedWork.title_english || loreSelectedWork.title || loreSelectedWork.title_canonical}
                              </div>
                              <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400 truncate">
                                Scoped to this anime only · {loreSelectedWork.work_id || loreSelectedWork.canonical_id || `MAL:${loreSelectedWork.mal_id}`}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setLoreSelectedWork(null);
                              setLoreWorkSearchText('');
                            }}
                            className="p-1 rounded-md hover:bg-purple-500/20 text-zinc-500 hover:text-rose-500 transition shrink-0"
                            title="Remove anime filter"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                            <input
                              type="text"
                              value={loreWorkSearchText}
                              onChange={(e) => setLoreWorkSearchText(e.target.value)}
                              onFocus={() => {
                                if (loreWorkSuggestions.length > 0) setLoreIsDropdownOpen(true);
                              }}
                              placeholder="Type anime title to restrict search (e.g. One Piece, Attack on Titan, Steins;Gate)..."
                              className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          {loreIsDropdownOpen && loreWorkSuggestions.length > 0 && (
                            <div className="absolute z-40 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl divide-y divide-zinc-100 dark:divide-zinc-800">
                              {loreWorkSuggestions
                                .filter((item) => {
                                  const t = String(item.type || item.format || 'ANIME').toUpperCase();
                                  return !['MANGA', 'MANHWA', 'MANHUA', 'NOVEL', 'LIGHT_NOVEL', 'VN', 'VISUAL_NOVEL'].includes(t);
                                })
                                .map((item, idx) => (
                                  <button
                                    key={item.work_id || item.canonical_id || item.id || idx}
                                    type="button"
                                    onClick={() => {
                                      setLoreSelectedWork(item);
                                      setLoreWorkSearchText('');
                                      setLoreIsDropdownOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-purple-500/10 flex items-center gap-2.5 transition"
                                  >
                                    {item.image_url ? (
                                      <img src={item.image_url} alt="" className="w-7 h-9 object-cover rounded shrink-0" />
                                    ) : (
                                      <div className="w-7 h-9 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                        <Film className="w-3.5 h-3.5 text-zinc-400" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                        {item.title_english || item.title || item.title_canonical}
                                      </div>
                                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                                        {item.release_year || item.year || 'Anime'} · {item.work_id || item.canonical_id || (item.mal_id ? `MAL:${item.mal_id}` : '')}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      <input
                        type="number"
                        min="1"
                        value={loreEpisodeNum}
                        onChange={(e) => setLoreEpisodeNum(e.target.value)}
                        placeholder="Episode # (Optional, e.g. 12)"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              <div className="relative flex-1 flex items-center">
              <SearchIcon className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  activeMode === 'catalog_search'
                    ? 'Search premise, tropes, characters, plot summary, or genres...'
                    : activeMode === 'scene_search'
                    ? 'Describe visual action, memorable quote, or exact scene moment...'
                    : activeMode === 'catalog_ask'
                    ? 'Ask a question describing a plot premise to let the LLM compare candidates and pinpoint the exact work...'
                    : 'Ask complex lore question with second-exact scene citations...'
                }
                className="w-full pl-11 sm:pl-12 pr-24 sm:pr-32 py-3 sm:py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-zinc-400"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-1.5 sm:right-2 px-3 sm:px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 sm:gap-2 shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Searching...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Run Query</span>
                    <span className="sm:hidden">Run</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
              </div>
            </div>
            </div>
          )}

          {/* Preset Samples */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium">
              Sample queries:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeMode === 'catalog_recommend' ? (
                samplePresets.catalog_recommend.map((preset) => {
                  const isSelected = positiveSeeds.some(s => s.id === preset.id);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        const seedObj = {
                          id: preset.id,
                          title: preset.label,
                          image_url: preset.img,
                          year: preset.year,
                          type: preset.type
                        };
                        setPositiveSeeds([seedObj]);
                        setNegativeSeeds([]);
                        setRecommendSearchText(preset.label);
                        executeSearch([preset.id], 'catalog_recommend');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? 'border-brand-500/50 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })
              ) : activeMode === 'lore_recommend' ? (
                (samplePresets.lore_recommend || []).map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setLoreDescriptivePrompt(preset);
                      executeSearch(preset, 'lore_recommend');
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition"
                  >
                    {preset}
                  </button>
                ))
              ) : (
                (samplePresets[activeMode] || []).map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setQuery(preset);
                      executeSearch(preset, activeMode);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition"
                  >
                    {preset}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Engine Parameters Bar (Granularity, Media Filter, Limit, Latency) */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400">
            {/* Granularity dropdown (for Scene Search and Lore Ask) */}
            {(activeMode === 'scene_search' || activeMode === 'lore_ask') && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px]">Granularity:</span>
                <select
                  value={granularity}
                  onChange={(e) => setGranularity(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono focus:outline-none"
                >
                  <option value="scene">Scene (Second-Exact Timestamps)</option>
                  <option value="episode">Episode Level</option>
                  <option value="arc">Story Arc Level</option>
                </select>
              </div>
            )}

            {/* Media Type Filter (Catalog Suite Only: Search, Recommend, Ask) */}
            {suite === 'catalog' && (activeMode === 'catalog_search' || activeMode === 'catalog_recommend' || activeMode === 'catalog_ask') && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <span className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Work Type:</span>
                <select
                  value={mediaType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMediaType(val);
                    if (results) {
                      setTimeout(() => {
                        if (activeMode === 'catalog_search' && query.trim()) {
                          searchApi.search(query.trim(), limit, searchMethod, val, adultFilter).then(setResults).catch(err => setError(err.message));
                        } else if (activeMode === 'catalog_recommend' && positiveSeeds.length > 0) {
                          const posIds = positiveSeeds.map(s => s.id);
                          const negIds = negativeSeeds.map(s => s.id);
                          searchApi.recommend(posIds, limit, negIds, val, adultFilter).then(setResults).catch(err => setError(err.message));
                        } else if (activeMode === 'catalog_ask' && query.trim()) {
                          searchApi.ask(query.trim(), limit, val, adultFilter).then(setResults).catch(err => setError(err.message));
                        }
                      }, 50);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono focus:outline-none"
                >
                  {MEDIA_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Result Limit Dropdown */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]">Result Limit:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono focus:outline-none"
              >
                <option value={4}>4 records</option>
                <option value={8}>8 records</option>
                <option value={12}>12 records</option>
                <option value={20}>20 records</option>
              </select>
            </div>

            {/* Adult Filter Switch (Catalog Suite: ON = adult:false hides +18, OFF = allows +18) */}
            {suite === 'catalog' && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Adult Filter:</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={adultFilter}
                  title={adultFilter ? "Adult content hidden (adult: false)" : "Adult content allowed"}
                  onClick={() => {
                    const nextVal = !adultFilter;
                    setAdultFilter(nextVal);
                    if (results) {
                      setTimeout(() => {
                        if (activeMode === 'catalog_search' && query.trim()) {
                          searchApi.search(query.trim(), limit, searchMethod, mediaType, nextVal).then(setResults).catch(err => setError(err.message));
                        } else if (activeMode === 'catalog_recommend' && positiveSeeds.length > 0) {
                          const posIds = positiveSeeds.map(s => s.id);
                          const negIds = negativeSeeds.map(s => s.id);
                          searchApi.recommend(posIds, limit, negIds, mediaType, nextVal).then(setResults).catch(err => setError(err.message));
                        } else if (activeMode === 'catalog_ask' && query.trim()) {
                          searchApi.ask(query.trim(), limit, mediaType, nextVal).then(setResults).catch(err => setError(err.message));
                        }
                      }, 50);
                    }
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    adultFilter ? 'bg-brand-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      adultFilter ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}

            {latencyMs !== null && (
              <span className="ml-auto font-mono text-[11px] text-zinc-400">
                latency: <strong className="text-emerald-500 font-semibold">{latencyMs} ms</strong>
              </span>
            )}
          </div>

        </form>

      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* RAW JSON INSPECTION DRAWER */}
      {showRawJson && results && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
            <span>Raw Backend Cluster Payload</span>
            <button
              onClick={async () => {
                await safeCopyToClipboard(JSON.stringify(results, null, 2));
              }}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full JSON</span>
            </button>
          </div>
          <pre className="p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      {/* RESULTS PRESENTATION */}
      <div ref={resultsSectionRef} className="scroll-mt-24" />
      {results && (
        <div className="space-y-6">
          
          {/* AI Synthesis Answer Card (/ask or /lore-ask) */}
          {(activeMode === 'catalog_ask' || activeMode === 'lore_ask') && results.answer && (
            <div className={`p-6 rounded-2xl border backdrop-blur-sm space-y-3 shadow-sm ${
              activeMode === 'lore_ask'
                ? 'border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20'
                : 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
            }`}>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider">
                <Sparkles className={`w-4 h-4 ${activeMode === 'lore_ask' ? 'text-rose-500' : 'text-emerald-500'}`} />
                <span className={activeMode === 'lore_ask' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {activeMode === 'lore_ask' ? 'Deep Lore AI Synthesis (Second-Exact Citations)' : 'Catalog Grounded AI Answer Layer'}
                </span>
              </div>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                {results.answer}
              </p>
            </div>
          )}

          {/* Catalog Discovery Results (/search or /ask results) */}
          {(activeMode === 'catalog_search' || activeMode === 'catalog_ask') && results.results && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.results.map((item, idx) => {
                const poster = item.image_url || item.images?.jpg?.image_url;
                const title = item.title_english || item.title || item.title_romaji || item.canonical_title || 'Untitled Work';
                const scoreDisplay = (() => {
                  const sc = item.score ?? item.community_score;
                  if (typeof sc === 'number') {
                    return sc <= 1.0 ? (sc * 10).toFixed(1) : sc.toFixed(1);
                  }
                  return sc;
                })();

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition flex gap-4 shadow-xs"
                  >
                    {/* Poster Thumbnail with Media-Specific Graceful Fallback */}
                    <WorkPoster
                      poster={poster}
                      title={title}
                      type={item.type}
                      format={item.format}
                    />

                    {/* Metadata Content */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {title}
                        </h3>
                        {scoreDisplay && (
                          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 font-semibold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {scoreDisplay}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        {(item.release_year || item.year) && <span>{item.release_year || item.year}</span>}
                        {(item.format || item.type) && <span className="uppercase">· {item.format || item.type}</span>}
                        {item.episodes && <span>· {item.episodes} eps</span>}
                      </div>

                      {(item.description || item.synopsis) && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {item.description || item.synopsis}
                        </p>
                      )}

                      {/* Genres */}
                      {item.genres && Array.isArray(item.genres) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.genres.slice(0, 3).map((g, gIdx) => (
                            <span
                              key={gIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            >
                              {typeof g === 'string' ? g : g.name || ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Advanced Scene & Lore Results (/advanced-search, /advanced-recommend, /lore-ask) */}
          {(activeMode === 'scene_search' || activeMode === 'lore_recommend' || activeMode === 'lore_ask') && (results.scenes || results.results) && (
            <div className="space-y-4">
              {(results.scenes || results.results).map((scene, idx) => {
                const title = scene.title || scene.title_english || scene.work_title || `Scene Record #${idx + 1}`;
                const timeDisplay = scene.timestamp_range || (scene.start_time ? `${scene.start_time}${scene.end_time ? ` - ${scene.end_time}` : ''}` : null);
                const scoreDisplay = typeof scene.score === 'number' ? `${(scene.score * 100).toFixed(1)}% match` : null;

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {title}
                        </span>
                        {scene.episode_number !== undefined && (
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                            EP {scene.episode_number}
                          </span>
                        )}
                        {scene.scene_number !== undefined && (
                          <span className="text-xs font-mono text-zinc-400 shrink-0">
                            Scene {scene.scene_number}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                        {timeDisplay && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{timeDisplay}</span>
                          </span>
                        )}
                        {scoreDisplay && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                            {scoreDisplay}
                          </span>
                        )}
                        {(scene.arc_name || scene.saga_name) && (
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hidden sm:inline-block">
                            {scene.arc_name || scene.saga_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location Tag */}
                    {scene.location && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{scene.location}</span>
                      </div>
                    )}

                    {/* Summary / Context Description */}
                    {(scene.summary || scene.description) && (
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                        {scene.summary || scene.description}
                      </p>
                    )}

                    {/* Matched Dialogue & Quotes with Speaker Recognition */}
                    {scene.quotes && Array.isArray(scene.quotes) && scene.quotes.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
                          <Quote className="w-3.5 h-3.5" />
                          <span>Matched Scene Dialogue</span>
                        </div>
                        <div className="space-y-1.5">
                          {scene.quotes.map((rawQuote, qIdx) => {
                            const q = formatQuote(rawQuote);
                            if (!q) return null;
                            return (
                              <div key={qIdx} className="text-xs font-serif italic text-zinc-700 dark:text-zinc-300 flex items-baseline gap-2">
                                {q.speaker && (
                                  <span className="font-sans font-semibold not-italic text-brand-600 dark:text-brand-400 text-[11px] shrink-0">
                                    [{q.speaker}]:
                                  </span>
                                )}
                                <span>"{q.text}"</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Characters involved */}
                    {scene.characters && Array.isArray(scene.characters) && scene.characters.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-zinc-400 font-mono">Present:</span>
                        {scene.characters.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          >
                            {typeof c === 'string' ? c : (c?.name || c?.character || JSON.stringify(c))}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Concepts */}
                    {scene.concepts && Array.isArray(scene.concepts) && scene.concepts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-zinc-400 font-mono">Concepts:</span>
                        {scene.concepts.map((cp, cpIdx) => (
                          <span
                            key={cpIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          >
                            {typeof cp === 'string' ? cp : (cp?.name || cp?.concept || JSON.stringify(cp))}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Work Recommendations Results (/recommend) */}
          {activeMode === 'catalog_recommend' && results.recommendations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.recommendations.map((item, idx) => {
                const poster = item.image_url || item.images?.jpg?.image_url;
                const title = item.title_english || item.title || item.title_romaji || item.canonical_title || 'Recommended Work';
                const scoreDisplay = (() => {
                  const sc = item.final_score ?? item.similarity_score ?? item.vector_similarity;
                  if (typeof sc === 'number') {
                    return `${(sc * 100).toFixed(1)}% match`;
                  }
                  return typeof item.score === 'number' ? `★ ${item.score.toFixed(1)}` : 'Recommended';
                })();

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition flex gap-4 shadow-xs"
                  >
                    {/* Poster Thumbnail with Media-Specific Graceful Fallback */}
                    <WorkPoster
                      poster={poster}
                      title={title}
                      type={item.type}
                      format={item.format}
                    />

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {title}
                        </h3>
                        {scoreDisplay && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 font-semibold">
                            {scoreDisplay}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        {(item.release_year || item.year) && <span>{item.release_year || item.year}</span>}
                        {(item.format || item.type) && <span className="uppercase">· {item.format || item.type}</span>}
                      </div>

                      {item.shared_tags && Array.isArray(item.shared_tags) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.shared_tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            >
                              {typeof tag === 'string' ? tag : (tag?.name || JSON.stringify(tag))}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
