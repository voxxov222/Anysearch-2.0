import React from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2 } from "lucide-react";

interface AiSummaryProps {
  summary: string | null;
  isLoading: boolean;
}

export function AiSummary({ summary, isLoading }: AiSummaryProps) {
  if (!summary && !isLoading) return null;

  return (
    <div className="w-full rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">AI Synthesis</h2>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm">Synthesizing results...</span>
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert prose-indigo max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <ReactMarkdown>{summary || ""}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
