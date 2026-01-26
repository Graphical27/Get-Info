"use client";

import { useState, useEffect } from "react";

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
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/Graphical27/Get-Info")
      .then((res) => res.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => setStars(null));
  }, []);

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
        hasSearched ? "justify-start pt-10 md:pt-25" : "justify-center"
      }`}
    >
      <div className="group font-sans-code absolute top-3 left-4 z-50 hidden w-50 max-w-xs flex-col gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white backdrop-blur-md transition-all hover:bg-white/10 hover:p-4 md:flex">
        <h3 className=" mt-0.5 flex cursor-help items-center gap-2 font-bold text-white/90  ">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
            ?
          </span>
          About Google Dorking
        </h3>
        <p className="max-h-0 overflow-hidden text-white/70 opacity-0 transition-all duration-500 ease-in-out group-hover:max-h-96 group-hover:opacity-100">
          Google Dorking (or Google Hacking) uses advanced search operators to
          find specific information indexed by Google. This tool automates these
          queries to help you discover publicly available data efficiently.
        </p>
      </div>

      {/* <a
        href="https://github.com/Graphical27/Get-Info"
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans-code absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10"
      >
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="currentColor"
          className="opacity-70"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span className={hasSearched ? "hidden md:inline" : ""}>
          Star on GitHub
          {stars !== null && (
            <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 font-bold text-white/90">
              {stars}
            </span>
          )}
        </span>
      </a> */}

      <div
        className={`flex flex-col items-center px-4 transition-all duration-700 ${
          hasSearched ? "scale-50 md:scale-70" : "scale-100"
        }`}
      >
        <div className="font-embed-code -mt-20 text-4xl tracking-wider uppercase md:-mt-30 md:text-8xl">
          <span>Search ID</span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 md:mt-8 md:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Instagram ID"
            className="font-sans-code w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder-white/50 backdrop-blur-md transition-all focus:border-white/50 focus:bg-white/10 focus:ring-2 focus:ring-white/20 focus:outline-none md:w-96 md:px-6 md:text-lg"
          />
          <button
            onClick={handleSearch}
            className="font-embed-code w-full rounded-lg bg-white px-8 py-3 text-base text-black transition-transform hover:scale-105 hover:bg-gray-200 active:scale-95 md:w-auto md:text-lg"
          >
            SEARCH
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div
        className={`container mt-8 px-4 transition-opacity duration-1000 md:mt-12 ${
          hasSearched ? "opacity-100" : "invisible opacity-0"
        }`}
      >
        {isLoading ? (
          <div className="font-sans-code flex flex-col items-center justify-center space-y-4 text-white/70">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            <p className="text-center text-sm md:text-base">
              Baking a fresh batch of posts for {query}...
              {jobProgress ? (
                <span className="ml-2 text-white/50">
                  ({jobProgress.fetched}/{jobProgress.max} pages)
                </span>
              ) : null}
            </p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-4xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 md:p-6">
            <div className="font-embed-code mb-2 text-base md:text-lg">
              Search error
            </div>
            <div className="font-sans-code text-xs text-white/90 opacity-90 md:text-sm">
              {error}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            {results.length === 0 ? (
              <div className="font-sans-code rounded-xl border border-white/10 bg-white/5 p-4 text-white/70 md:p-6">
                No results.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:gap-6">
                  {results.map((result, index) => (
                    <a
                      key={`${result.url}-${index}`}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 md:p-6"
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
                      <h3 className="font-embed-code mb-2 text-lg font-bold text-blue-300 group-hover:underline md:text-xl">
                        {result.title || result.formattedUrl || result.url}
                      </h3>
                      <p className="font-sans-code text-xs leading-relaxed text-gray-300 md:text-sm">
                        {result.snippet}
                      </p>
                    </a>
                  ))}
                </div>

                {jobStatus ? (
                  <div className="font-sans-code mt-6 text-center text-xs text-white/50 md:mt-8">
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
