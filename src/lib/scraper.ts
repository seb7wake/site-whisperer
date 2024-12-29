import axios from "axios";
import { load } from "cheerio";

const getBrowserHeaders = () => ({
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  Cookie: "cf_clearance=your_clearance_token",
});

const fetchPage = async (url: string) => {
  const response = await axios.get(url, {
    headers: getBrowserHeaders(),
    maxRedirects: 5,
    validateStatus: (status) => status < 500,
  });

  // Wait for JavaScript and CloudFlare
  await new Promise((resolve) => setTimeout(resolve, 5000));

  return response.data;
};

const extractTitle = ($: any) => {
  let title = $("title").text().trim();
  if (title.includes("Just a moment...")) {
    title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      "Untitled Page";
  }
  return title;
};

const extractSections = ($: any, chunkSize = 500) => {
  // Remove script and style elements
  $("script").remove();
  $("style").remove();

  // Get clean text content
  const fullText = $("body").text().replace(/\s+/g, " ").trim();
  const words = fullText.split(" ");
  const sections: string[] = [];

  // Split into chunks
  for (let i = 0; i < words.length; i += chunkSize) {
    sections.push(words.slice(i, i + chunkSize).join(" "));
  }

  return sections;
};

const extractLinks = ($: any, baseUrl: string): string[] => {
  const links: string[] = [];
  const urlObj = new URL(baseUrl);
  const domain = urlObj.hostname;

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      try {
        const absoluteUrl = new URL(href, baseUrl);
        // Only include links from same domain and with http(s) protocol
        if (
          absoluteUrl.hostname === domain &&
          (absoluteUrl.protocol === "http:" ||
            absoluteUrl.protocol === "https:")
        ) {
          links.push(absoluteUrl.href);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }
  });

  return [...new Set(links)]; // Remove duplicates
};

export const scrape = async (url: string) => {
  const visited = new Set<string>();
  const toVisit = [url];
  const maxPages = 5;
  const pages: Array<{ url: string; title: string; sections: string[] }> = [];

  while (toVisit.length > 0 && visited.size < maxPages) {
    const currentUrl = toVisit.shift()!;

    if (visited.has(currentUrl)) {
      continue;
    }

    try {
      const html = await fetchPage(currentUrl);
      const $ = load(html);
      visited.add(currentUrl);

      const title = extractTitle($);
      const sections = extractSections($);
      pages.push({ url: currentUrl, title, sections });

      // Get new links to visit
      const links = extractLinks($, currentUrl);
      for (const link of links) {
        if (!visited.has(link) && !toVisit.includes(link)) {
          toVisit.push(link);
        }
      }
    } catch (error) {
      console.error(`Error scraping ${currentUrl}:`, error);
    }
  }

  return pages;
};
