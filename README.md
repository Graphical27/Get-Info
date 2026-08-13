# Get-Info

A Next.js and FastAPI application that searches Google's public index for
Instagram or Reddit username matches.

## Result preview

Select any search result to open an in-app detail drawer. The drawer shows:

- the matched identity in a rounded profile treatment;
- the comment, caption, or mention text returned in Google's snippet;
- author, date, source, and thumbnail metadata when Google provides it;
- a post preview and a separate link to the original result;
- an explicit warning when a complete cached page is unavailable.

Google snippets can be partial or outdated. They may preserve some text after a
source post is changed or removed, but this app cannot guarantee recovery of a
complete deleted comment or private content.

## Search providers

The backend uses SerpApi by default. If SerpApi is unavailable and Google Custom
Search credentials are configured, it automatically falls back to Google's JSON
API. Existing Google Custom Search customers can also set
`SEARCH_PROVIDER=google_cse` to use it directly.



