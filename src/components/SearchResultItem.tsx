import React from "react";
import { SearchResult } from "../types";

export function SearchResultItem({ result }: { result: SearchResult }) {
  // Extract a readable domain from the URL
  const domain = React.useMemo(() => {
    try {
      const url = new URL(result.url);
      return url.hostname;
    } catch {
      return result.url;
    }
  }, [result.url]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-5 mb-4 group">
      <div className="flex items-center gap-2 mb-2">
        {/* Placeholder favicon, relying on standard service */}
        <img 
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
          alt=""
          className="w-4 h-4 rounded-sm bg-zinc-100 dark:bg-zinc-800"
          loading="lazy"
        />
        <a 
          href={result.url}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors"
        >
          {result.url}
        </a>
      </div>
      
      <a 
        href={result.url}
        target="_blank" 
        rel="noopener noreferrer"
        className="block group-hover:opacity-80 transition-opacity"
      >
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight decoration-indigo-200 dark:decoration-indigo-800 underline-offset-4 group-hover:underline">
          {result.title}
        </h3>
      </a>
      
      <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed line-clamp-3">
        {result.snippet}
      </p>
    </div>
  );
}
