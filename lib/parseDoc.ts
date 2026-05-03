/**
 * Shared Google-Docs HTML parser used by the chapter reader and the search
 * indexer. Splits a published Google Doc into per-page HTML chunks and moves
 * footnote definitions onto the page that contains their reference anchor.
 */

export interface DocPage {
  /** 1-based page number relative to the document (NOT the original print page). */
  docPageNumber: number;
  /** HTML for this page (with Google's inline classes preserved). */
  html: string;
}

export interface ParsedDoc {
  styles: string;
  pages: DocPage[];
}

/** Prefix every selector in `css` with `prefix` so the rules are scoped. */
export function scopeCss(css: string, prefix: string): string {
  css = css.replace(/@(import|charset)[^;]*;/gi, "");
  const out: string[] = [];
  let i = 0;
  while (i < css.length) {
    if (css[i] === "@") {
      const braceStart = css.indexOf("{", i);
      if (braceStart === -1) break;
      const head = css.slice(i, braceStart);
      let depth = 1;
      let j = braceStart + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === "{") depth++;
        else if (css[j] === "}") depth--;
        j++;
      }
      const inner = css.slice(braceStart + 1, j - 1);
      out.push(`${head}{${scopeCss(inner, prefix)}}`);
      i = j;
      continue;
    }
    const braceStart = css.indexOf("{", i);
    if (braceStart === -1) break;
    const braceEnd = css.indexOf("}", braceStart);
    if (braceEnd === -1) break;
    const selectors = css.slice(i, braceStart);
    const body = css.slice(braceStart, braceEnd + 1);
    const scoped = selectors
      .split(",")
      .map((s) => {
        const t = s.trim();
        if (!t) return "";
        if (t.startsWith(prefix)) return t;
        if (/^\d+%$/.test(t) || t === "from" || t === "to") return t;
        return `${prefix} ${t}`;
      })
      .filter(Boolean)
      .join(", ");
    out.push(`${scoped} ${body}`);
    i = braceEnd + 1;
  }
  return out.join("\n");
}

/** Browser-only: parse a published Google Doc HTML response. */
export function parseDocument(html: string): ParsedDoc {
  let styles = "";
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm: RegExpExecArray | null;
  while ((sm = styleRe.exec(html)) !== null) styles += sm[1];

  styles = scopeCss(styles, ".chapter-doc");
  styles += `
    .chapter-doc { background: transparent; color: #000; }
    .chapter-doc .doc-content { padding: 0 !important; max-width: none !important; }
    .chapter-doc sup a, .chapter-doc .c7 a { color: #1a5cb8; text-decoration: none; cursor: pointer; }
    .chapter-doc sup a:hover, .chapter-doc .c7 a:hover { text-decoration: underline; }
    .chapter-doc hr.c21, .chapter-doc hr[class="c21"] { width: 33%; height: 0; border: none; border-top: 1px solid #000; margin: 12pt 0 4pt; }
    .chapter-doc img { max-width: 100%; height: auto; }
    .chapter-doc mark.search-hit { background: #ffe26a; color: inherit; padding: 0 1px; border-radius: 2px; }
    .chapter-doc mark.search-hit-active { background: #ff9d33; color: #000; }
  `;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root: Element = doc.querySelector(".doc-content") ?? doc.body;

  // Pull footnote definitions
  const fnSep = root.querySelector("hr.c21");
  const footnotes: Array<{ id: string; html: string }> = [];
  if (fnSep) {
    let n: Node | null = fnSep.nextSibling;
    while (n) {
      if (n.nodeType === Node.ELEMENT_NODE) {
        const anchor = (n as Element).querySelector("[id^='ftnt']");
        if (anchor) footnotes.push({ id: anchor.id, html: (n as Element).outerHTML });
      }
      n = n.nextSibling;
    }
    let rem: Node | null = fnSep;
    while (rem) {
      const next: Node | null = rem.nextSibling;
      rem.parentNode?.removeChild(rem);
      rem = next;
    }
  }

  // Page-break HRs
  const pbHrs = Array.from(root.querySelectorAll<HTMLHRElement>("hr[style]")).filter(
    (hr) => /page-break/i.test(hr.getAttribute("style") ?? "")
  );

  const nodesToHtml = (start: Node | null, end: Node | null): string => {
    const parts: string[] = [];
    let n = start;
    while (n && n !== end) {
      parts.push(
        n.nodeType === Node.ELEMENT_NODE
          ? (n as Element).outerHTML
          : (n.textContent ?? "")
      );
      n = n.nextSibling;
    }
    return parts.join("");
  };

  const rawParts: string[] = [];
  let cursor: Node | null = root.firstChild;
  for (const hr of pbHrs) {
    rawParts.push(nodesToHtml(cursor, hr));
    cursor = hr.nextSibling;
  }
  rawParts.push(nodesToHtml(cursor, null));

  let pages: DocPage[] = rawParts
    .map((h, i) => ({ docPageNumber: i + 1, html: h }))
    .filter((p) => p.html.trim().length > 20);

  if (pages.length === 0) {
    pages = [{ docPageNumber: 1, html: root.innerHTML }];
  }

  // Place each footnote at the bottom of the page that contains its reference
  for (const fn of footnotes) {
    const refId = fn.id.replace(/^ftnt(\d+)$/, "ftnt_ref$1");
    const idx = pages.findIndex((p) => p.html.includes(`id="${refId}"`));
    const target = idx !== -1 ? idx : pages.length - 1;
    const hasSep = pages[target].html.includes('class="c21"');
    pages[target] = {
      ...pages[target],
      html: pages[target].html + (hasSep ? "" : '<hr class="c21">') + fn.html,
    };
  }

  return { styles, pages };
}

/** Strip HTML tags, decode basic entities, collapse whitespace. */
export function htmlToPlainText(html: string): string {
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
  return stripped.replace(/\s+/g, " ").trim();
}
