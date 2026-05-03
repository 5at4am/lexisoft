"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { DictionaryEntry } from "./DictionarySearch";

interface SearchResultProps {
  entry: DictionaryEntry;
}

export default function SearchResult({ entry }: SearchResultProps) {
  const [showExtras, setShowExtras] = useState(false);

  const playAudio = () => {
    const audioUrl = entry.phonetics.find(p => p.audio)?.audio;
    if (audioUrl) {
      new Audio(audioUrl).play();
    }
  };

  const hasAudio = entry.phonetics.some(p => p.audio);

  // Extract all synonyms and antonyms from all meanings
  const allSynonyms = Array.from(new Set(entry.meanings.flatMap(m => [
    ...m.synonyms,
    ...m.definitions.flatMap(d => d.synonyms)
  ])));

  const allAntonyms = Array.from(new Set(entry.meanings.flatMap(m => [
    ...m.antonyms,
    ...m.definitions.flatMap(d => d.antonyms)
  ])));

  const allExamples = entry.meanings.flatMap(m => 
    m.definitions.filter(d => d.example).map(d => ({
      text: d.example!,
      partOfSpeech: m.partOfSpeech
    }))
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="editorial-card p-10 md:p-16 soft-shadow relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      
      <motion.div variants={itemVariants} className="flex justify-between items-end mb-12">
        <div>
          <h2 
            style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
            className="text-5xl md:text-7xl font-medium mb-4 capitalize tracking-tight"
          >
            {entry.word}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-accent text-xl font-medium tracking-widest">{entry.phonetic}</span>
            {hasAudio && (
              <button 
                onClick={playAudio}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-accent-soft text-accent hover:bg-accent hover:text-white transition-all transform hover:scale-110 active:scale-95"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="space-y-12">
        {entry.meanings.map((meaning, idx) => (
          <motion.div key={idx} variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">{meaning.partOfSpeech}</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            
            <ul className="space-y-6">
              {meaning.definitions.map((def, defIdx) => (
                <li key={defIdx} className="group">
                  <div className="flex gap-6">
                    <span className="text-muted/40 font-serif italic text-lg">{defIdx + 1}</span>
                    <p className="text-xl text-foreground/80 leading-relaxed font-light">
                      {def.definition}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="mt-16 pt-10 border-t border-border/40 flex justify-center">
        <button
          onClick={() => setShowExtras(!showExtras)}
          className="group flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold text-muted hover:text-accent transition-all"
        >
          {showExtras ? "Condense" : "Explore Nuances"}
          <div className={`transition-transform duration-300 ${showExtras ? 'rotate-180' : 'group-hover:translate-y-1'}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>
      </motion.div>

      <AnimatePresence>
        {showExtras && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-8 space-y-8">
              {allSynonyms.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Synonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {allSynonyms.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-accent-soft text-accent text-sm font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {allAntonyms.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Antonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {allAntonyms.map((a, i) => (
                      <span key={i} className="px-2 py-1 border border-border rounded-md text-muted text-sm">
                        {a}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {allExamples.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Examples</h4>
                  <div className="space-y-4">
                    {allExamples.slice(0, 3).map((ex, i) => (
                      <div key={i} className="p-4 bg-background rounded-xl border border-border/50 italic text-foreground/80">
                        "{ex.text}"
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
