"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchResult from "./SearchResult";

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: { text: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }[];
    synonyms: string[];
    antonyms: string[];
  }[];
}

export default function DictionarySearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [ghostSuggestion, setGhostSuggestion] = useState("");
  
  const cache = useRef<Map<string, DictionaryEntry>>(new Map());
  const suggestionTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll to result when it appears
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // Calculate ghost text
  useEffect(() => {
    if (query && suggestions.length > 0) {
      const topSuggestion = suggestions[0];
      if (topSuggestion.toLowerCase().startsWith(query.toLowerCase())) {
        setGhostSuggestion(query + topSuggestion.slice(query.length));
      } else {
        setGhostSuggestion("");
      }
    } else {
      setGhostSuggestion("");
    }
  }, [query, suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://api.datamuse.com/sug?s=${input.trim()}&max=5`);
      const data = await response.json();
      setSuggestions(data.map((item: any) => item.word));
    } catch (err) {
      console.error("Suggestion fetch failed", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);

    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    suggestionTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 200);
  };

  const handleSearch = useCallback(async (wordToSearch?: string) => {
    const word = (wordToSearch || query).trim().toLowerCase();
    if (!word) return;

    setQuery(word);
    setError(null);
    setShowSuggestions(false);
    setGhostSuggestion("");
    
    if (cache.current.has(word)) {
      setResult(cache.current.get(word)!);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? "Word not found" : "Failed to fetch");
      }
      const data = await response.json();
      const entry = data[0];
      cache.current.set(word, entry);
      setResult(entry);
    } catch (err: any) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if ((e.key === "Tab" || e.key === "ArrowRight") && ghostSuggestion && query.length < ghostSuggestion.length) {
      e.preventDefault();
      setQuery(ghostSuggestion);
      setGhostSuggestion("");
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <motion.div 
      layout
      ref={containerRef} 
      className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12 transition-all duration-700 ease-in-out"
    >
      <motion.div 
        layout
        initial={false}
        animate={{ 
          marginTop: result ? "-2rem" : "0rem",
          scale: result ? 0.95 : 1,
          opacity: result ? 0.8 : 1
        }}
        className="text-center mb-8 relative transition-all duration-500"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/5 rounded-full blur-[60px] -z-10" />
        
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white border border-border/40 soft-shadow text-[10px] font-bold tracking-[0.2em] uppercase text-muted"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Lexical Intelligence
        </motion.div>
        
        <motion.h1 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
          className="text-5xl md:text-7xl font-medium tracking-tight mb-4 word-glow"
        >
          Lexi<span className="text-accent italic">Soft</span>
        </motion.h1>
        
        <motion.p 
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light"
        >
          A minimalist sanctuary for word exploration.
        </motion.p>
      </motion.div>

      <motion.form 
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", damping: 20 }}
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        className="relative mb-12"
      >
        <div className="relative group">
          {/* Ghost Text Overlay */}
          <div 
            className="absolute inset-0 h-16 pl-16 pr-8 text-xl flex items-center pointer-events-none text-muted/20"
            aria-hidden="true"
          >
            {ghostSuggestion}
          </div>

          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for a word..."
            className="relative z-10 w-full h-16 pl-16 pr-8 bg-transparent border border-border/60 rounded-3xl text-xl focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all soft-shadow placeholder:text-muted/40"
          />
          {/* White background for input since input itself is transparent */}
          <div className="absolute inset-0 bg-white rounded-3xl -z-10" />
          
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted/60 group-focus-within:text-accent transition-colors z-20">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" strokeWidth={1.5} />}
          </div>

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full mt-2 bg-white/80 backdrop-blur-xl border border-border/60 rounded-2xl overflow-hidden soft-shadow z-50"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSearch(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-6 py-4 transition-colors text-lg flex items-center justify-between ${
                      index === selectedIndex ? "bg-accent-soft text-accent" : "text-muted/80"
                    }`}
                  >
                    <span>{suggestion}</span>
                    {index === selectedIndex && (
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Enter to select</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.div layout className="mt-4 flex flex-wrap gap-2 justify-center">
          {["Ethereal", "Luminous", "Sonder", "Resilient"].map((word, i) => (
            <motion.button
              layout
              key={word}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              type="button"
              onClick={() => handleSearch(word)}
              className="text-xs font-medium px-4 py-2 rounded-xl border border-border/40 hover:border-accent/40 hover:bg-white transition-all text-muted hover:text-accent"
            >
              {word}
            </motion.button>
          ))}
        </motion.div>
      </motion.form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 text-center editorial-card"
          >
            <p className="text-muted text-lg">{error}. Try another word?</p>
          </motion.div>
        )}

        {result && (
          <motion.div 
            key={result.word}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 120,
              duration: 0.6 
            }}
            ref={resultRef} 
            className="scroll-mt-12"
          >
            <SearchResult entry={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
