import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/search", async (req, res) => {
    try {
      const { query, tag, params, max_results, format, apiKey: clientApiKey } = req.body;
      const apiKey = clientApiKey || process.env.ANYSEARCH_API_KEY;
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      // Map specialized alternative categories to AnySearch standard categories with enhanced query tags
      let apiTag = tag;
      let apiQuery = query;
      
      const customTagModifiers: Record<string, { tag: string, prefix?: string, suffix?: string }> = {
        "unfiltered.conspiracy": {
          tag: "general.general",
          suffix: " controversial conspiracy theories alternative history undocumented evidence"
        },
        "database.undocumented": {
          tag: "general.general",
          suffix: " raw data dump leaked open index database files xlsx csv sql"
        },
        "ideas.unheard": {
          tag: "general.general",
          suffix: " unheard of rare ideas unconventional theories fringe concepts"
        },
        "indexing.substructure": {
          tag: "general.general",
          suffix: " raw server indexing logs config route paths substructures"
        },
        "internet.alternative": {
          tag: "general.general",
          suffix: " decentralised network Web3 IPFS Freenet peer to peer"
        },
        "internet.hidden_base": {
          tag: "general.general",
          suffix: " deep web onion services hidden directory files"
        }
      };

      if (tag && customTagModifiers[tag]) {
        const modifier = customTagModifiers[tag];
        apiTag = modifier.tag;
        if (modifier.prefix) apiQuery = `${modifier.prefix} ${apiQuery}`;
        if (modifier.suffix) apiQuery = `${apiQuery} ${modifier.suffix}`;
      }

      const requestBody = {
        query: apiQuery,
        ...(apiTag && { tag: apiTag }),
        ...(params && Object.keys(params).length > 0 && { params }),
        ...(format && { format }),
        max_results: max_results || 10
      };

      const response = await fetch("https://api.anysearch.com/v1/search", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json(errorData);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return res.json(data);
      } else {
        const textData = await response.text();
        return res.json({
          code: 0,
          message: "success",
          data: {
            markdown: textData,
            results: []
          }
        });
      }
    } catch (error: any) {
      console.error("Search API Error:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  app.post("/api/summarize", async (req, res) => {
    try {
      const { query, results } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const context = results.map((r: any, i: number) => `[${i + 1}] Title: ${r.title}\nURL: ${r.url}\nContent: ${r.snippet}\n${r.content}`).join('\n\n');
      
      const prompt = `You are an AI research assistant. Summarize the following search results for the query: "${query}".\nProvide a concise, comprehensive synthesis of the information found in the results. Cite sources using [1], [2], etc. where appropriate.\n\nSearch Results:\n${context}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ summary: response.text });
    } catch (error: any) {
      console.error("Summarize API Error:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
