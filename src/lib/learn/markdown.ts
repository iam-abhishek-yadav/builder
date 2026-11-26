import GithubSlugger from "github-slugger";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

/** Strips fenced code blocks so `#` lines inside code aren't treated as headings. */
function withoutCode(markdown: string) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, "");
}

/**
 * h2/h3 headings with the same ids rehype-slug generates: both run github-slugger
 * over every heading in document order, so duplicate titles get matching -1, -2 suffixes.
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  for (const match of withoutCode(markdown).matchAll(/^(#{1,6})\s+(.+?)\s*#*\s*$/gm)) {
    const depth = match[1].length;
    const text = match[2].replace(/[`*_~]|\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
    const id = slugger.slug(text);
    if (depth === 2 || depth === 3) items.push({ id, text, depth });
  }
  return items;
}

export function readingMinutes(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
