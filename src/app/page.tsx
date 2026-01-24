"use client";

import { useState } from "react";
import Image from "next/image";

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  displayLink?: string;
  formattedUrl?: string;
}

type JobStatus = "queued" | "running" | "completed" | "failed";

interface StartJobResponse {
  jobId: string;
  error?: string;
}

interface JobResponse {
  jobId: string;
  status: JobStatus;
  provider: string;
  username: string;
  query: string;
  createdAt: string;
  updatedAt: string;
  fetchedPages: number;
  maxPages: number;
  pageSize: number;
  items: SearchResult[];
  error?: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [jobProgress, setJobProgress] = useState<{
    fetched: number;
    max: number;
  } | null>(null);

  const handleSearch = async () => {
    const username = query.trim();
    if (!username) return;

    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    setResults([]);
    setJobId(null);
    setJobStatus(null);
    setJobProgress(null);

    try {
      const startRes = await fetch("/api/search/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, maxPages: 5, pageSize: 10 }),
      });

      const startData = (await startRes.json()) as StartJobResponse;
      if (!startRes.ok || !startData.jobId) {
        setError(startData.error || "Failed to start search job");
        setIsLoading(false);
        return;
      }

      setJobId(startData.jobId);
      setJobStatus("queued");

      const poll = async () => {
        const jobRes = await fetch(
          `/api/search/job/${encodeURIComponent(startData.jobId)}`,
        );
        const jobData = (await jobRes.json()) as JobResponse;

        if (!jobRes.ok) {
          setError(jobData.error || "Failed to fetch job status");
          setIsLoading(false);
          return;
        }

        setResults(jobData.items || []);
        setJobStatus(jobData.status);
        setJobProgress({
          fetched: jobData.fetchedPages,
          max: jobData.maxPages,
        });

        if (jobData.status === "completed") {
          setIsLoading(false);
          return;
        }
        if (jobData.status === "failed") {
          setError(jobData.error || "Search job failed");
          setIsLoading(false);
          return;
        }

        window.setTimeout(poll, 900);
      };

      void poll();
    } catch {
      setError("Network error while searching");
      setIsLoading(false);
    }
  };

  return (
    <section
      className={`gradient-bg flex min-h-screen flex-col items-center transition-all duration-700 ease-in-out ${
        hasSearched ? "justify-start pt-20" : "justify-center"
      }`}
    >
      <div
        className={`flex flex-col items-center transition-all duration-700 ${
          hasSearched ? "scale-70" : "scale-100"
        }`}
      >
        <div className="font-embed-code -mt-30 text-8xl tracking-wider uppercase">
          <span>Search ID</span>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Instagram ID"
            className="font-sans-code w-96 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-lg text-white placeholder-white/50 backdrop-blur-md transition-all focus:border-white/50 focus:bg-white/10 focus:ring-2 focus:ring-white/20 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="font-embed-code rounded-lg bg-white px-8 py-3 text-lg text-black transition-transform hover:scale-105 hover:bg-gray-200 active:scale-95"
          >
            SEARCH
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div
        className={`container mt-12 px-4 transition-opacity duration-1000 ${
          hasSearched ? "opacity-100" : "invisible opacity-0"
        }`}
      >
        {isLoading ? (
          <div className="font-sans-code flex flex-col items-center justify-center space-y-4 text-white/70">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            <p>
              Searching for site:instagram.com intext:{query}...
              {jobProgress ? (
                <span className="ml-2 text-white/50">
                  ({jobProgress.fetched}/{jobProgress.max} pages)
                </span>
              ) : null}
            </p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-4xl rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            <div className="font-embed-code mb-2 text-lg">Search error</div>
            <div className="font-sans-code text-sm opacity-90">{error}</div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            {results.length === 0 ? (
              <div className="font-sans-code rounded-xl border border-white/10 bg-white/5 p-6 text-white/70">
                No results.
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {results.map((result, index) => (
                    <a
                      key={`${result.url}-${index}`}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
                    >
                      <div className="font-sans-code mb-2 flex items-center gap-2 text-xs text-white/50">
                        {result.displayLink ||
                          (() => {
                            try {
                              return new URL(result.url).hostname;
                            } catch {
                              return "";
                            }
                          })()}
                      </div>
                      <h3 className="font-embed-code mb-2 text-xl font-bold text-blue-300 group-hover:underline">
                        {result.title || result.formattedUrl || result.url}
                      </h3>
                      <p className="font-sans-code text-sm leading-relaxed text-gray-300">
                        {result.snippet}
                      </p>
                    </a>
                  ))}
                </div>

                {jobStatus ? (
                  <div className="font-sans-code mt-8 text-center text-xs text-white/50">
                    Job: {jobId} • Status: {jobStatus}
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
