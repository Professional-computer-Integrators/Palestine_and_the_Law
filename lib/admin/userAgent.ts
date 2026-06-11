// Minimal UA parsing. Returns a friendly browser label like "Chrome 135"
// and a coarse device class.

export function parseUserAgent(ua: string | null | undefined): {
  browser: string;
  device: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Unknown";
} {
  if (!ua) return { browser: "Unknown", device: "Unknown" };

  const lower = ua.toLowerCase();

  let device: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Unknown" = "Desktop";
  if (/bot|crawler|spider|crawling/i.test(ua)) device = "Bot";
  else if (/ipad|tablet|playbook|silk/i.test(ua)) device = "Tablet";
  else if (/mobile|iphone|android|phone|opera mini|iemobile/i.test(ua)) device = "Mobile";

  let browser = "Unknown";
  const edgeMatch = ua.match(/Edg(?:e|A|iOS)?\/(\d+)/);
  const operaMatch = ua.match(/(?:OPR|Opera)\/(\d+)/);
  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  const safariVersionMatch = ua.match(/Version\/(\d+)/);
  const safariMatch = lower.includes("safari");

  if (edgeMatch) browser = `Edge ${edgeMatch[1]}`;
  else if (operaMatch) browser = `Opera ${operaMatch[1]}`;
  else if (firefoxMatch) browser = `Firefox ${firefoxMatch[1]}`;
  else if (chromeMatch) browser = `Chrome ${chromeMatch[1]}`;
  else if (safariMatch && safariVersionMatch) browser = `Safari ${safariVersionMatch[1]}`;
  else if (safariMatch) browser = "Safari";

  return { browser, device };
}

export function parseSource(referer: string | null | undefined, origin: string): string {
  if (!referer) return "Direct";
  try {
    const url = new URL(referer);
    if (url.origin === origin) return "Direct";
    const host = url.hostname.replace(/^www\./, "");
    if (host.includes("google.")) return "Google Search";
    if (host.includes("bing.")) return "Bing";
    if (host.includes("duckduckgo.")) return "DuckDuckGo";
    if (host.includes("yahoo.")) return "Yahoo";
    if (host.includes("baidu.")) return "Baidu";
    if (host.includes("yandex.")) return "Yandex";
    if (host.includes("linkedin.")) return "LinkedIn";
    if (host.includes("twitter.") || host === "t.co" || host.includes("x.com")) return "X / Twitter";
    if (host.includes("facebook.") || host === "fb.com") return "Facebook";
    if (host.includes("reddit.")) return "Reddit";
    if (host.includes("github.")) return "GitHub";
    return host;
  } catch {
    return "Direct";
  }
}
