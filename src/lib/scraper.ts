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

const extractSections = ($: any, chunkSize = 200) => {
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

export const scrape = async (url: string) => {
  const html = await fetchPage(url);
  const $ = load(html);

  const title = extractTitle($);
  const sections = extractSections($);

  console.log(sections);

  return {
    title,
    sections,
  };
};
