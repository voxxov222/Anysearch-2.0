import React, { useState, useEffect } from "react";
import { SearchInput } from "./components/SearchInput";
import { SearchResultItem } from "./components/SearchResultItem";
import { AiSummary } from "./components/AiSummary";
import { SearchResult, SearchMetadata } from "./types";
import { cn } from "./lib/utils";
import { Key, X } from "lucide-react";

export default function App() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [paramsText, setParamsText] = useState("");
  const [format, setFormat] = useState("json");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [metadata, setMetadata] = useState<SearchMetadata | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("anysearch_api_key");
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("anysearch_api_key", apiKey);
    setShowApiKeyModal(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setResults([]);
    setMetadata(null);
    setSummary(null);

    let parsedParams = {};
    if (paramsText.trim()) {
      try {
        parsedParams = JSON.parse(paramsText);
      } catch (err) {
        setError("Invalid JSON format in Additional Parameters.");
        setIsSearching(false);
        return;
      }
    }

    try {
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query, 
          tag, 
          params: parsedParams,
          format,
          apiKey,
          max_results: 10 
        }),
      });

      const searchData = await searchRes.json();

      if (!searchRes.ok || searchData.code !== 0) {
        throw new Error(searchData.message || searchData.error || "Failed to search");
      }

      const fetchedResults = searchData.data?.results || [];
      const fetchedMarkdown = searchData.data?.markdown || searchData.markdown || null;
      
      setResults(fetchedResults);
      setMetadata(searchData.data?.metadata || null);

      if (format === "markdown" && fetchedMarkdown) {
        setSummary(fetchedMarkdown);
      } else if (fetchedResults.length > 0 && format !== "markdown") {
        setIsSummarizing(true);
        try {
          const summaryRes = await fetch("/api/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, results: fetchedResults }),
          });

          const summaryData = await summaryRes.json();
          if (summaryRes.ok && summaryData.summary) {
            setSummary(summaryData.summary);
          } else {
            console.error("Summary failed:", summaryData.error);
          }
        } catch (sumErr) {
          console.error("Summary error:", sumErr);
        } finally {
          setIsSummarizing(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
      
      {/* Top Navigation */}
      <nav className="h-16 px-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">A</div>
          <span className="text-lg font-bold tracking-tight">AnySearch</span>
        </div>
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Key className="h-4 w-4" />
          API Key
        </button>
      </nav>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">API Key Settings</h3>
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
              Enter your AnySearch API key for authenticated API requests. This unlocks higher rate limits and your paid quota. The key is stored securely in your browser.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="YOUR_ANYSEARCH_API_KEY"
              className="block w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 mb-6 font-mono text-sm"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col min-h-[calc(100vh-4rem)]">
        
        {/* Header / Search Area */}
        <header 
          className={cn(
            "flex flex-col items-center justify-center w-full transition-all duration-700 ease-in-out",
            hasSearched ? "pt-12 pb-8" : "flex-1 pb-24"
          )}
        >
          <div className={cn(
            "flex flex-col items-center text-center transition-all duration-700",
            hasSearched ? "mb-8" : "mb-12"
          )}>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight underline decoration-indigo-200 dark:decoration-indigo-900 underline-offset-8">
              AnySearch
            </h1>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              Unrestricted research engine powered by decentralized AI indexing.
            </p>
          </div>

          <SearchInput
            query={query}
            setQuery={setQuery}
            tag={tag}
            setTag={setTag}
            paramsText={paramsText}
            setParamsText={setParamsText}
            format={format}
            setFormat={setFormat}
            onSearch={handleSearch}
            isLoading={isSearching}
            centered={!hasSearched}
          />
        </header>

        {/* Results Area */}
        {hasSearched && (
          <main className="flex-1 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {error && (
              <div className="p-4 mb-8 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-100 dark:border-red-900/50 shadow-sm">
                {error}
              </div>
            )}

            {!isSearching && !error && results.length === 0 && !summary && (
              <div className="text-center py-20 text-zinc-500">
                No results found for your query. Try adjusting your keywords or category.
              </div>
            )}

            {(results.length > 0 || isSearching || summary) && (
              <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
                
                {/* Main Results Column */}
                {results.length > 0 && (
                  <div className="flex-1 min-w-0">
                    {metadata && (
                      <div className="text-[10px] font-mono text-zinc-500 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <span>Found {metadata.total_results} results</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{metadata.search_time_ms}ms</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      {results.map((result, idx) => (
                        <SearchResultItem key={idx} result={result} />
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Summary Sidebar (Desktop) / Top (Mobile) */}
                {(isSummarizing || summary || (isSearching && format !== "markdown")) && (
                  <div className={cn(
                    "shrink-0 order-first lg:order-last",
                    results.length > 0 ? "w-full lg:w-[380px]" : "w-full lg:max-w-4xl lg:mx-auto"
                  )}>
                    <AiSummary summary={summary} isLoading={isSummarizing || (isSearching && format !== "markdown")} />
                  </div>
                )}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

