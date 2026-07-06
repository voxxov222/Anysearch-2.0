import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Settings2, Code, FileJson, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { TAGS, FORMATS } from "../types";

interface SearchInputProps {
  query: string;
  setQuery: (q: string) => void;
  tag: string;
  setTag: (t: string) => void;
  paramsText: string;
  setParamsText: (p: string) => void;
  format: string;
  setFormat: (f: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
  centered?: boolean;
}

export function SearchInput({
  query,
  setQuery,
  tag,
  setTag,
  paramsText,
  setParamsText,
  format,
  setFormat,
  onSearch,
  isLoading,
  centered = false,
}: SearchInputProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find currently selected tag label
  const selectedTag = TAGS.find((t) => t.value === tag) || TAGS[0];

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("w-full max-w-3xl flex flex-col gap-3 transition-all duration-500 ease-in-out", centered ? "mb-8" : "")}>
      <form onSubmit={onSearch} className="w-full flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to research?"
            className="block w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 sm:text-sm transition-shadow"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex w-full sm:w-auto gap-3">
          {/* Custom Category Dropdown */}
          <div className="relative w-full sm:w-64" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-between py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-100 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                isDropdownOpen && "ring-2 ring-indigo-500/50 border-indigo-500"
              )}
            >
              <span className="truncate">{selectedTag.label}</span>
              <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", isDropdownOpen && "transform rotate-180")} />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-full max-h-64 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {TAGS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setTag(t.value);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                      t.value === tag 
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold" 
                        : "text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "flex-shrink-0 inline-flex items-center justify-center p-3 border rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
              showAdvanced 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400" 
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
            title="Advanced Search Options"
          >
            <Settings2 className="h-5 w-5" />
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex-shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm rounded-md font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>
      
      {showAdvanced && (
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" />
                Additional Parameters (JSON)
              </label>
              <textarea
                value={paramsText}
                onChange={(e) => setParamsText(e.target.value)}
                placeholder={'{"library": "golang"}'}
                className="block w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs font-mono resize-y min-h-[80px]"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Pass domain-specific parameters (e.g. ticker, library)</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileJson className="h-3.5 w-3.5" />
                Response Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="block w-full py-2.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 text-sm cursor-pointer"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
