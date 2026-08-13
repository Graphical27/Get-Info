"use client";

import { Fragment, useEffect, useRef, useState } from "react";

type Platform = "instagram" | "reddit";
type JobStatus = "queued" | "running" | "completed" | "failed";

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  displayLink?: string;
  formattedUrl?: string;
  author?: string;
  date?: string;
  source?: string;
  thumbnail?: string;
  favicon?: string;
  cachedPageLink?: string;
  position?: number;
}

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

function PlatformIcon({
  platform,
  className = "h-4 w-4",
}: {
  platform: Platform;
  className?: string;
}) {
  if (platform === "reddit") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614.028.168.042.351.042.52 0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .378-.239l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249C10.498 12.561 9.937 12 9.249 12zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.33.33 0 0 0-.435-.463c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.149-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.849 0-3.205.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838A6.162 6.162 0 1 0 12 18.162 6.162 6.162 0 0 0 12 5.838zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  );
}

function ExternalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function getResultPlatform(url: string, fallback: Platform): Platform {
  return url.toLowerCase().includes("reddit.com") ? "reddit" : fallback;
}

function cleanHandle(value: string) {
  return value
    .trim()
    .replace(/^by\s+/i, "")
    .replace(/^@/, "")
    .replace(/^u\//i, "")
    .split(" · ")[0]
    .trim();
}

function getIdentity(result: SearchResult, fallback: string, platform: Platform) {
  const suppliedAuthor = cleanHandle(result.author || "");
  if (suppliedAuthor && !/^(instagram|reddit)$/i.test(suppliedAuthor)) {
    return suppliedAuthor;
  }

  try {
    const segments = new URL(result.url).pathname.split("/").filter(Boolean);
    if (platform === "reddit") {
      const userIndex = segments.findIndex((part) => /^(user|u)$/i.test(part));
      if (userIndex >= 0 && segments[userIndex + 1]) {
        return cleanHandle(segments[userIndex + 1]);
      }
    } else if (
      segments[0] &&
      !["p", "reel", "tv", "explore", "stories", "accounts"].includes(
        segments[0].toLowerCase(),
      )
    ) {
      return cleanHandle(segments[0]);
    }
  } catch {
    // The searched handle remains the safest fallback for malformed URLs.
  }

  return cleanHandle(fallback) || "matched profile";
}

function getResultKind(url: string, platform: Platform) {
  const lower = url.toLowerCase();
  if (platform === "reddit") {
    return lower.includes("/comments/") ? "Comment thread" : "Profile result";
  }
  if (lower.includes("/reel/")) return "Reel";
  if (lower.includes("/p/") || lower.includes("/tv/")) return "Post";
  return "Profile result";
}

function getDisplayLink(result: SearchResult) {
  if (result.displayLink) return result.displayLink;
  try {
    return new URL(result.url).hostname.replace(/^www\./, "");
  } catch {
    return result.formattedUrl || "Public web result";
  }
}

function getInitials(value: string) {
  const parts = value.split(/[._\-\s]+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : value.slice(0, 2))
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "") || "ID";
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const needle = cleanHandle(query);
  if (!needle) return text;

  const escapedNeedle = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedNeedle})`, "gi"));

  return parts.map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-amber-300/15 px-0.5 text-amber-100"
      >
        {part}
      </mark>
    ) : (
      <Fragment key={`${part}-${index}`}>{part}</Fragment>
    ),
  );
}

function ResultDetailPanel({
  result,
  searchedHandle,
  selectedIndex,
  totalResults,
  fallbackPlatform,
  onClose,
  onPrevious,
  onNext,
}: {
  result: SearchResult;
  searchedHandle: string;
  selectedIndex: number;
  totalResults: number;
  fallbackPlatform: Platform;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const resultPlatform = getResultPlatform(result.url, fallbackPlatform);
  const identity = getIdentity(result, searchedHandle, resultPlatform);
  const indexedText = result.snippet || result.title || "No indexed text returned.";
  const cachedLink = result.cachedPageLink?.startsWith("http")
    ? result.cachedPageLink
    : null;

  const copyIndexedText = async () => {
    try {
      await navigator.clipboard.writeText(indexedText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const thumbnailStyle = result.thumbnail
    ? { backgroundImage: `url(${JSON.stringify(result.thumbnail)})` }
    : undefined;

  return (
    <>
      <button
        type="button"
        aria-label="Close result preview"
        onClick={onClose}
        className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm lg:hidden"
      />
      <aside
        id="result-detail-panel"
        role="dialog"
        aria-label="Google indexed result details"
        className="result-detail-panel fixed inset-x-3 top-18 bottom-3 z-70 overflow-y-auto rounded-3xl border border-white/15 bg-[#101112]/96 shadow-2xl shadow-black/70 backdrop-blur-2xl lg:sticky lg:inset-auto lg:top-6 lg:z-10 lg:max-h-[calc(100vh-3rem)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#101112]/92 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
            <span className="font-sans-code text-[11px] tracking-[0.16em] text-white/55 uppercase">
              Google indexed
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`relative flex h-13 w-13 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-offset-2 ring-offset-[#101112] ${
                resultPlatform === "instagram"
                  ? "bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 ring-fuchsia-400/50"
                  : "bg-gradient-to-br from-orange-400 to-red-600 ring-orange-400/50"
              }`}
              aria-hidden="true"
            >
              {getInitials(identity)}
              <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#101112] bg-white text-black">
                <PlatformIcon platform={resultPlatform} className="h-3 w-3" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-sans-code truncate text-base font-semibold text-white">
                  {resultPlatform === "instagram" ? "@" : "u/"}
                  {identity}
                </h2>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] tracking-wider text-white/45 uppercase">
                  matched identity
                </span>
              </div>
              <p className="font-sans-code mt-1 text-[11px] text-white/40">
                {result.date || getResultKind(result.url, resultPlatform)}
              </p>
            </div>
          </div>

          <section aria-labelledby="indexed-text-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3
                id="indexed-text-heading"
                className="font-sans-code text-[10px] tracking-[0.18em] text-white/40 uppercase"
              >
                Comment / caption match
              </h3>
              <button
                type="button"
                onClick={copyIndexedText}
                className="font-sans-code text-[10px] text-white/45 transition hover:text-white"
              >
                {copied ? "Copied" : "Copy text"}
              </button>
            </div>
            <blockquote className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <span className="font-embed-code absolute top-0 left-3 text-5xl leading-none text-white/8">
                “
              </span>
              <p className="font-sans-code relative text-sm leading-7 text-white/86">
                <HighlightedText text={indexedText} query={searchedHandle} />
              </p>
            </blockquote>
          </section>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <span className="font-sans-code text-[9px] tracking-[0.2em] text-white/30 uppercase">
              matched post
            </span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
            <div
              className={`post-preview-image relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-[#17191a] bg-cover bg-center ${
                result.thumbnail ? "has-thumbnail" : ""
              }`}
              style={thumbnailStyle}
            >
              {!result.thumbnail ? (
                <div className="flex flex-col items-center gap-2 text-white/25">
                  <PlatformIcon platform={resultPlatform} className="h-8 w-8" />
                  <span className="font-sans-code text-[9px] tracking-wider uppercase">
                    Preview not indexed
                  </span>
                </div>
              ) : null}
              <span className="absolute top-3 left-3 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 font-sans-code text-[9px] text-white/70 backdrop-blur-md">
                {getResultKind(result.url, resultPlatform)}
              </span>
            </div>
            <div className="p-4">
              <p className="font-sans-code mb-2 text-[10px] text-white/38">
                {result.source || getDisplayLink(result)}
              </p>
              <h4 className="font-embed-code text-base leading-snug text-blue-200">
                {result.title || result.formattedUrl || result.url}
              </h4>
            </div>
          </article>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans-code flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-blue-100"
            >
              Open original <ExternalIcon />
            </a>
            {cachedLink ? (
              <a
                href={cachedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans-code flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Try cached copy <ExternalIcon />
              </a>
            ) : (
              <div className="font-sans-code flex items-center justify-center rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-center text-[10px] text-white/32">
                No full cached page returned
              </div>
            )}
          </div>

          <div className="font-sans-code mt-5 rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-3 text-[10px] leading-5 text-amber-100/55">
            This preview uses only metadata Google returned. The text can be
            partial or outdated, and it cannot reliably restore an entire
            deleted comment or private post.
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
            <button
              type="button"
              onClick={onPrevious}
              disabled={totalResults < 2}
              className="font-sans-code rounded-lg px-2 py-1.5 text-xs text-white/55 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              ← Previous
            </button>
            <span className="font-sans-code text-[10px] text-white/30">
              {selectedIndex + 1} / {totalResults}
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={totalResults < 2}
              className="font-sans-code rounded-lg px-2 py-1.5 text-xs text-white/55 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              Next →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchedHandle, setSearchedHandle] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [jobProgress, setJobProgress] = useState<{
    fetched: number;
    max: number;
  } | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [stars, setStars] = useState<number | null>(null);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const activeJobId = useRef<string | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/Graphical27/Get-Info")
      .then((response) => response.json())
      .then((data) => setStars(data.stargazers_count))
      .catch(() => setStars(null));
  }, []);

  useEffect(() => {
    if (!selectedResult) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedResult(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedResult]);

  const handleSearch = async () => {
    const username = query.trim();
    if (!username) return;

    activeJobId.current = null;
    setSearchedHandle(username);
    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    setResults([]);
    setSelectedResult(null);
    setJobStatus(null);
    setJobProgress(null);
    setProvider(null);

    try {
      const startResponse = await fetch("/api/search/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username,
          maxPages: 5,
          pageSize: 10,
          platforms: [platform],
        }),
      });

      const startData = (await startResponse.json()) as StartJobResponse;
      if (!startResponse.ok || !startData.jobId) {
        setError(startData.error || "Failed to start search job");
        setIsLoading(false);
        return;
      }

      activeJobId.current = startData.jobId;
      setJobStatus("queued");

      const poll = async () => {
        if (activeJobId.current !== startData.jobId) return;

        const jobResponse = await fetch(
          `/api/search/job/${encodeURIComponent(startData.jobId)}`,
        );
        const jobData = (await jobResponse.json()) as JobResponse;

        if (activeJobId.current !== startData.jobId) return;
        if (!jobResponse.ok) {
          setError(jobData.error || "Failed to fetch job status");
          setIsLoading(false);
          return;
        }

        setResults(jobData.items || []);
        setJobStatus(jobData.status);
        setProvider(jobData.provider);
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

  const selectedIndex = selectedResult
    ? results.findIndex((result) => result.url === selectedResult.url)
    : -1;

  const moveSelection = (direction: -1 | 1) => {
    if (results.length < 2) return;
    const nextIndex =
      (Math.max(selectedIndex, 0) + direction + results.length) % results.length;
    setSelectedResult(results[nextIndex]);
  };

  const showInitialLoading = isLoading && results.length === 0;
  const showEmpty = !isLoading && !error && results.length === 0;

  return (
    <main
      className={`gradient-bg flex min-h-screen flex-col items-center transition-all duration-700 ease-in-out ${
        hasSearched ? "justify-start pt-24 md:pt-12" : "justify-center"
      }`}
    >
      <div className="group font-sans-code fixed top-3 left-4 z-50 hidden w-50 max-w-xs flex-col gap-2 rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-xs text-white backdrop-blur-md transition-all hover:w-70 hover:bg-black/85 hover:p-4 md:flex">
        <h3 className="mt-0.5 flex cursor-help items-center gap-2 font-bold text-white/90">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
            ?
          </span>
          About indexed results
        </h3>
        <p className="max-h-0 overflow-hidden text-white/60 opacity-0 transition-all duration-500 ease-in-out group-hover:max-h-96 group-hover:opacity-100">
          Search ID uses Google operators to find public snippets. Select a
          result to inspect the indexed text, matched identity, and post preview
          without leaving this page.
        </p>
      </div>

      <a
        href="https://github.com/Graphical27/Get-Info"
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans-code fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/80"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current opacity-70">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span className={hasSearched ? "hidden md:inline" : ""}>
          Star on GitHub
          {stars !== null ? (
            <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 font-bold text-white/90">
              {stars}
            </span>
          ) : null}
        </span>
      </a>

      <section
        aria-label="Search controls"
        className={`flex flex-col items-center px-4 transition-all duration-700 ${
          hasSearched ? "md:scale-75" : "scale-100"
        }`}
      >
        <div
          className={`font-embed-code text-4xl tracking-wider uppercase transition-all duration-700 md:text-8xl ${
            hasSearched ? "md:-mt-4" : "-mt-20 md:-mt-30"
          }`}
        >
          <span>Search ID</span>
        </div>

        <div className="mt-6 flex w-full max-w-2xl flex-col items-center gap-3 md:mt-8 md:flex-row md:gap-4">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void handleSearch()}
            placeholder={
              platform === "reddit" ? "Enter Reddit username" : "Enter Instagram ID"
            }
            aria-label="Username to search"
            className="font-sans-code w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 backdrop-blur-md transition-all focus:border-blue-300/60 focus:bg-white/10 focus:ring-2 focus:ring-blue-300/15 focus:outline-none md:w-96 md:px-6 md:text-lg"
          />
          <select
            value={platform}
            onChange={(event) => setPlatform(event.target.value as Platform)}
            aria-label="Platform"
            className="font-sans-code w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white backdrop-blur-md transition-all focus:border-white/50 focus:bg-white/10 focus:ring-2 focus:ring-white/20 focus:outline-none md:w-auto md:text-lg [&>option]:text-black"
          >
            <option value="instagram">Instagram</option>
            <option value="reddit">Reddit</option>
          </select>
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isLoading}
            className="font-embed-code w-full rounded-lg bg-white px-8 py-3 text-base text-black transition-transform hover:scale-105 hover:bg-blue-100 active:scale-95 disabled:cursor-wait disabled:opacity-60 md:w-auto md:text-lg"
          >
            {isLoading ? "SEARCHING" : "SEARCH"}
          </button>
        </div>
      </section>

      <section
        aria-label="Search results"
        className={`container mt-8 px-4 pb-16 transition-opacity duration-700 md:mt-4 ${
          hasSearched ? "opacity-100" : "invisible opacity-0"
        }`}
      >
        {showInitialLoading ? (
          <div
            className="font-sans-code flex flex-col items-center justify-center space-y-4 pt-8 text-white/70"
            role="status"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-blue-300" />
            <p className="text-center text-sm md:text-base">
              Reading Google&apos;s public index for {searchedHandle}…
              {jobProgress ? (
                <span className="ml-2 text-white/40">
                  ({jobProgress.fetched}/{jobProgress.max} pages)
                </span>
              ) : null}
            </p>
          </div>
        ) : error && results.length === 0 ? (
          <div className="mx-auto max-w-4xl rounded-2xl border border-red-500/25 bg-red-500/8 p-5 text-red-100 md:p-6">
            <div className="font-embed-code mb-2 text-lg">Search error</div>
            <div className="font-sans-code text-xs leading-6 text-white/70 md:text-sm">
              {error}
            </div>
          </div>
        ) : showEmpty ? (
          <div className="font-sans-code mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
            No public Google snippets were found for this username.
          </div>
        ) : results.length > 0 ? (
          <div
            className={`results-workspace mx-auto grid transition-all duration-500 ease-out ${
              selectedResult
                ? "max-w-7xl lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-6"
                : "max-w-4xl"
            }`}
          >
            <div
              className={`min-w-0 transition-transform duration-500 ${
                selectedResult ? "lg:-translate-x-2" : ""
              }`}
            >
              <div className="font-sans-code mb-4 flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
                <div className="flex items-center gap-2 text-white/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                  <span>{results.length} indexed matches</span>
                  <span className="text-white/20">•</span>
                  <span className="text-white/35">
                    {provider === "google_cse" ? "Google CSE" : "Google via SerpApi"}
                  </span>
                </div>
                {isLoading && jobProgress ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/45">
                    Fetching page {Math.min(jobProgress.fetched + 1, jobProgress.max)} of{" "}
                    {jobProgress.max}
                  </span>
                ) : (
                  <span className="text-white/30">Select a result to inspect</span>
                )}
              </div>

              {isLoading && jobProgress ? (
                <div className="mb-4 h-px overflow-hidden bg-white/8">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-fuchsia-400 transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        8,
                        (jobProgress.fetched / jobProgress.max) * 100,
                      )}%`,
                    }}
                  />
                </div>
              ) : null}

              <div className="grid gap-4 md:gap-5">
                {results.map((result, index) => {
                  const resultPlatform = getResultPlatform(result.url, platform);
                  const isSelected = selectedResult?.url === result.url;
                  return (
                    <article
                      key={`${result.url}-${index}`}
                      className={`result-card group relative overflow-hidden rounded-2xl border bg-[#111]/80 backdrop-blur-sm transition-all duration-300 ${
                        isSelected
                          ? "border-blue-300/50 bg-blue-300/[0.075] shadow-[0_0_0_1px_rgba(147,197,253,0.12)]"
                          : "border-white/10 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.075]"
                      }`}
                    >
                      <button
                        type="button"
                        aria-controls="result-detail-panel"
                        aria-expanded={isSelected}
                        onClick={() => setSelectedResult(result)}
                        className="block w-full p-4 pr-14 text-left md:p-6 md:pr-16"
                      >
                        <div className="font-sans-code mb-3 flex flex-wrap items-center gap-2 text-[11px] text-white/42">
                          <span
                            className={
                              resultPlatform === "instagram"
                                ? "text-pink-400"
                                : "text-orange-400"
                            }
                          >
                            <PlatformIcon platform={resultPlatform} />
                          </span>
                          <span className="truncate">{getDisplayLink(result)}</span>
                          <span className="text-white/18">•</span>
                          <span>{getResultKind(result.url, resultPlatform)}</span>
                          {result.date ? (
                            <>
                              <span className="text-white/18">•</span>
                              <span>{result.date}</span>
                            </>
                          ) : null}
                        </div>
                        <h3 className="font-embed-code mb-2 text-lg leading-snug font-bold text-blue-300 transition group-hover:text-blue-200 md:text-xl">
                          {result.title || result.formattedUrl || result.url}
                        </h3>
                        <p className="result-snippet font-sans-code text-xs leading-6 text-gray-300/90 md:text-sm md:leading-7">
                          {result.snippet || "No text snippet was returned by Google."}
                        </p>
                        <div className="font-sans-code mt-4 flex items-center gap-2 text-[10px] tracking-wide text-blue-200/55 uppercase transition group-hover:text-blue-200/85">
                          View indexed content <span aria-hidden="true">→</span>
                        </div>
                      </button>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${result.title || "result"} in a new tab`}
                        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-black/30 text-white/35 transition hover:border-white/20 hover:bg-white/10 hover:text-white md:top-5 md:right-5"
                      >
                        <ExternalIcon />
                      </a>
                    </article>
                  );
                })}
              </div>

              {error ? (
                <div className="font-sans-code mt-4 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-xs text-amber-100/65">
                  Search stopped early: {error}
                </div>
              ) : null}
              {jobStatus ? (
                <div className="font-sans-code mt-6 text-center text-[10px] tracking-wider text-white/25 uppercase">
                  {jobStatus === "completed" ? "Index scan complete" : `Status: ${jobStatus}`}
                </div>
              ) : null}
            </div>

            {selectedResult ? (
              <ResultDetailPanel
                key={selectedResult.url}
                result={selectedResult}
                searchedHandle={searchedHandle}
                selectedIndex={Math.max(selectedIndex, 0)}
                totalResults={results.length}
                fallbackPlatform={platform}
                onClose={() => setSelectedResult(null)}
                onPrevious={() => moveSelection(-1)}
                onNext={() => moveSelection(1)}
              />
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
