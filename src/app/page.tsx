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
  const [platform, setPlatform] = useState<"instagram" | "reddit">("instagram");

  const getPlatformIcon = (url: string) => {
    if (url.includes("instagram.com")) {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 text-pink-500"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.149-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.849 0-3.205.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    }
    if (url.includes("reddit.com")) {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 text-orange-500"
        >
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 text-gray-500"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ); // Default Globe icon
  };

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
        body: JSON.stringify({
          username,
          maxPages: 5,
          pageSize: 10,
          platforms: [platform],
        }),
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
        <h3 className="mt-0.5 flex cursor-help items-center gap-2 font-bold text-white/90">
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
            placeholder={
              platform === "reddit"
                ? "Enter Reddit Username"
                : "Enter Instagram ID"
            }
            className="font-sans-code w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder-white/50 backdrop-blur-md transition-all focus:border-white/50 focus:bg-white/10 focus:ring-2 focus:ring-white/20 focus:outline-none md:w-96 md:px-6 md:text-lg"
          />
          <select
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value as "instagram" | "reddit")
            }
            className="font-sans-code w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white backdrop-blur-md transition-all focus:border-white/50 focus:bg-white/10 focus:ring-2 focus:ring-white/20 focus:outline-none md:w-auto md:text-lg [&>option]:text-black"
          >
            <option value="instagram">Instagram</option>
            <option value="reddit">Reddit</option>
          </select>
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
                        {getPlatformIcon(result.url)}
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
