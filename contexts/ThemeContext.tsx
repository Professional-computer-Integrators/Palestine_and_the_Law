"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { hexToRgb, lighten, darken } from "@/lib/colorUtils";

export const DEFAULT_PRIMARY = "#3a6491";

export const FONT_OPTIONS = [
  // ── Serif heading + Sans body ──────────────────────────────────────
  { id: "classic",    label: "Classic — Playfair Display + Inter",         headingVar: "--font-playfair",    bodyVar: "--font-inter" },
  { id: "editorial",  label: "Editorial — Lora + Open Sans",               headingVar: "--font-lora",        bodyVar: "--font-opensans" },
  { id: "scholarly",  label: "Scholarly — Crimson Text + Source Sans",     headingVar: "--font-crimson",     bodyVar: "--font-sourcesans" },
  { id: "elegant",    label: "Elegant — EB Garamond + Raleway",            headingVar: "--font-garamond",    bodyVar: "--font-raleway" },
  { id: "literary",   label: "Literary — Cormorant Garamond + Nunito",     headingVar: "--font-cormorant",   bodyVar: "--font-nunito" },
  { id: "academic",   label: "Academic — Libre Baskerville + Libre Franklin", headingVar: "--font-baskerville", bodyVar: "--font-franklin" },
  { id: "heritage",   label: "Heritage — Spectral + Karla",               headingVar: "--font-spectral",    bodyVar: "--font-karla" },
  { id: "refined",    label: "Refined — Cardo + Cabin",                   headingVar: "--font-cardo",       bodyVar: "--font-cabin" },
  { id: "classic2",   label: "Classic II — Libre Caslon + Mulish",        headingVar: "--font-caslon",      bodyVar: "--font-mulish" },
  { id: "journal",    label: "Journal — Domine + Fira Sans",              headingVar: "--font-domine",      bodyVar: "--font-firasans" },
  // ── Sans heading + Sans body ────────────────────────────────────────
  { id: "modern",     label: "Modern — Merriweather + Roboto",            headingVar: "--font-merriweather", bodyVar: "--font-roboto" },
  { id: "clean",      label: "Clean — Work Sans + DM Sans",               headingVar: "--font-worksans",    bodyVar: "--font-dmsans" },
  { id: "geometric",  label: "Geometric — Josefin Sans + Jost",           headingVar: "--font-josefin",     bodyVar: "--font-jost" },
  { id: "minimal",    label: "Minimal — Outfit + Manrope",                headingVar: "--font-outfit",      bodyVar: "--font-manrope" },
  { id: "corporate",  label: "Corporate — Barlow + IBM Plex Sans",        headingVar: "--font-barlow",      bodyVar: "--font-ibmplexsans" },
  // ── Display / expressive ────────────────────────────────────────────
  { id: "bold",       label: "Bold — Syne + Space Grotesk",               headingVar: "--font-syne",        bodyVar: "--font-spacegrotesk" },
  { id: "humanist",   label: "Humanist — Tenor Sans + Plus Jakarta Sans", headingVar: "--font-tenorsans",   bodyVar: "--font-jakarta" },
  { id: "newspaper",  label: "Newspaper — Zilla Slab + PT Sans",          headingVar: "--font-zillaslab",   bodyVar: "--font-ptsans" },
  { id: "academic2",  label: "Academic II — Fraunces + Nunito Sans",      headingVar: "--font-fraunces",    bodyVar: "--font-nunitosans" },
  { id: "typewriter", label: "Typewriter — Roboto Slab + Roboto Mono",    headingVar: "--font-robotoslab",  bodyVar: "--font-robotomono" },
  // ── Extra sans-serif ────────────────────────────────────────────────
  { id: "poppins",     label: "Poppins — Poppins + Poppins",               headingVar: "--font-poppins",     bodyVar: "--font-poppins" },
  { id: "montserrat",  label: "Montserrat — Montserrat + Montserrat",       headingVar: "--font-montserrat",  bodyVar: "--font-montserrat" },
  { id: "urbanist",    label: "Urbanist — Urbanist + Urbanist",             headingVar: "--font-urbanist",    bodyVar: "--font-urbanist" },
  { id: "lexend",      label: "Lexend — Lexend + Lexend",                   headingVar: "--font-lexend",      bodyVar: "--font-lexend" },
  { id: "figtree",     label: "Figtree — Figtree + Figtree",               headingVar: "--font-figtree",     bodyVar: "--font-figtree" },
  { id: "redhat",      label: "Red Hat — Red Hat Display + Epilogue",       headingVar: "--font-redhat",      bodyVar: "--font-epilogue" },
  { id: "epilogue",    label: "Epilogue — Epilogue + Epilogue",             headingVar: "--font-epilogue",    bodyVar: "--font-epilogue" },
  { id: "hahmlet",     label: "Hahmlet — Hahmlet + Urbanist",              headingVar: "--font-hahmlet",     bodyVar: "--font-urbanist" },
  { id: "mplus1",      label: "M PLUS 1 — M PLUS 1 + Lexend",             headingVar: "--font-mplus1",      bodyVar: "--font-lexend" },
  { id: "ntr",         label: "NTR — NTR + Open Sans",                     headingVar: "--font-ntr",         bodyVar: "--font-opensans" },
  // ── Serif + Sans combinations ────────────────────────────────────────
  { id: "imperial",      label: "Imperial — Cinzel + Montserrat",              headingVar: "--font-cinzel",       bodyVar: "--font-montserrat" },
  { id: "cinzeldm",      label: "Cinzel & DM Sans — Cinzel + DM Sans",         headingVar: "--font-cinzel",       bodyVar: "--font-dmsans" },
  { id: "magazine",      label: "Magazine — Abril Fatface + Lato",             headingVar: "--font-abrilfatface", bodyVar: "--font-lato" },
  { id: "bodoniurban",   label: "Bodoni & Urbanist — Bodoni Moda + Urbanist",  headingVar: "--font-bodonim",      bodyVar: "--font-urbanist" },
  { id: "bodoniepi",     label: "Bodoni & Epilogue — Bodoni Moda + Epilogue",  headingVar: "--font-bodonim",      bodyVar: "--font-epilogue" },
  { id: "arvointer",     label: "Arvo & Inter — Arvo + Inter",                 headingVar: "--font-arvo",         bodyVar: "--font-inter" },
  { id: "arvorubik",     label: "Arvo & Rubik — Arvo + Rubik",                 headingVar: "--font-arvo",         bodyVar: "--font-rubik" },
  { id: "alegreyaspace", label: "Alegreya & Space — Alegreya + Space Grotesk", headingVar: "--font-alegreya",     bodyVar: "--font-spacegrotesk" },
  { id: "alegreyajkt",   label: "Alegreya & Jakarta — Alegreya + Jakarta",     headingVar: "--font-alegreya",     bodyVar: "--font-jakarta" },
  { id: "ptsuite",       label: "PT Suite — PT Serif + Lato",                  headingVar: "--font-ptserif",      bodyVar: "--font-lato" },
  { id: "ptrubik",       label: "PT & Rubik — PT Serif + Rubik",               headingVar: "--font-ptserif",      bodyVar: "--font-rubik" },
  { id: "pttitillium",   label: "PT & Titillium — PT Serif + Titillium Web",   headingVar: "--font-ptserif",      bodyVar: "--font-titilliumweb" },
  { id: "vollkornrubik", label: "Vollkorn & Rubik — Vollkorn + Rubik",         headingVar: "--font-vollkorn",     bodyVar: "--font-rubik" },
  { id: "vollkornpop",   label: "Vollkorn & Poppins — Vollkorn + Poppins",     headingVar: "--font-vollkorn",     bodyVar: "--font-poppins" },
  { id: "philosopher",   label: "Philosopher — Philosopher + Quicksand",       headingVar: "--font-philosopher",  bodyVar: "--font-quicksand" },
  { id: "neutonubuntu",  label: "Neuton & Ubuntu — Neuton + Ubuntu",           headingVar: "--font-neuton",       bodyVar: "--font-ubuntu" },
  { id: "neutonfigure",  label: "Neuton & Figtree — Neuton + Figtree",         headingVar: "--font-neuton",       bodyVar: "--font-figtree" },
  { id: "gildaasap",     label: "Gilda & Asap — Gilda Display + Asap",         headingVar: "--font-gilda",        bodyVar: "--font-asap" },
  { id: "gildamanrope",  label: "Gilda & Manrope — Gilda Display + Manrope",   headingVar: "--font-gilda",        bodyVar: "--font-manrope" },
  { id: "oldstandard",   label: "Old Standard — Old Standard TT + Exo 2",      headingVar: "--font-oldstandard",  bodyVar: "--font-exo2" },
] as const;

export type FontOptionId = (typeof FONT_OPTIONS)[number]["id"];

export interface SiteUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
}

/** A saved theme preset captures every customisation the admin can apply
 *  to the site so it can be re-applied with a single click. */
export interface ThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  fontOptionId: string;
  pageTexts: Record<string, string>;
  pageColors: Record<string, string>;
  createdAt: string;
}

interface ThemeContextValue {
  primaryColor: string;
  applyColor: (hex: string) => void;
  savedColors: string[];
  saveColor: (hex: string) => void;
  removeColor: (hex: string) => void;
  fontOptionId: FontOptionId;
  setFontOptionId: (id: FontOptionId) => void;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  adminPassword: string;
  setAdminPassword: (pw: string) => void;
  updates: SiteUpdate[];
  addUpdate: (title: string, content: string) => void;
  deleteUpdate: (id: string) => void;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  pageTexts: Record<string, string>;
  updatePageText: (id: string, text: string) => void;
  resetPageText: (id: string) => void;
  pageColors: Record<string, string>;
  updatePageColor: (id: string, color: string) => void;
  resetPageColor: (id: string) => void;
  presets: ThemePreset[];
  savePreset: (name: string) => void;
  applyPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  primaryColor: DEFAULT_PRIMARY,
  applyColor: () => {},
  savedColors: [],
  saveColor: () => {},
  removeColor: () => {},
  fontOptionId: "classic",
  setFontOptionId: () => {},
  isAdmin: false,
  login: () => false,
  logout: () => {},
  adminPassword: "password",
  setAdminPassword: () => {},
  updates: [],
  addUpdate: () => {},
  deleteUpdate: () => {},
  editMode: false,
  setEditMode: () => {},
  pageTexts: {},
  updatePageText: () => {},
  resetPageText: () => {},
  pageColors: {},
  updatePageColor: () => {},
  resetPageColor: () => {},
  presets: [],
  savePreset: () => {},
  applyPreset: () => {},
  deletePreset: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyPrimaryToDom(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const lightHex = lighten(hex, 0.22);
  const darkHex = darken(hex, 0.22);
  const [rl, gl, bl] = hexToRgb(lightHex);
  const [rd, gd, bd] = hexToRgb(darkHex);
  const root = document.documentElement;
  root.style.setProperty("--color-primary", `${r} ${g} ${b}`);
  root.style.setProperty("--color-primary-light", `${rl} ${gl} ${bl}`);
  root.style.setProperty("--color-primary-dark", `${rd} ${gd} ${bd}`);
}

function applyFontToDom(id: FontOptionId) {
  const opt = FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
  const root = document.documentElement;
  root.style.setProperty("--font-heading", `var(${opt.headingVar})`);
  root.style.setProperty("--font-body", `var(${opt.bodyVar})`);
}

/* ─── helper to POST settings to server ────────────────────────── */
async function syncToServer(
  payload: Record<string, unknown>,
  password: string
) {
  try {
    await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // silently fail — changes already applied in-memory
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [fontOptionId, setFontState] = useState<FontOptionId>("classic");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPw] = useState("password");
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);
  const [editMode, setEditModeState] = useState(false);
  const [pageTexts, setPageTexts] = useState<Record<string, string>>({});
  const [pageColors, setPageColors] = useState<Record<string, string>>({});
  const [presets, setPresets] = useState<ThemePreset[]>([]);

  useEffect(() => {
    // Load per-admin localStorage prefs (saved palette, password)
    const storedSaved: string[] = JSON.parse(
      localStorage.getItem("theme_saved_colors") ?? "[]"
    );
    const storedPw = localStorage.getItem("admin_password") ?? "password";
    setSavedColors(storedSaved);
    setAdminPw(storedPw);

    // Restore session auth
    if (sessionStorage.getItem("admin_auth") === "1") {
      setIsAdmin(true);
    }

    // Fetch shared settings from server (source of truth for all users)
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.primaryColor) {
          setPrimaryColor(data.primaryColor);
          applyPrimaryToDom(data.primaryColor);
        }
        if (data.fontOptionId) {
          setFontState(data.fontOptionId as FontOptionId);
          applyFontToDom(data.fontOptionId as FontOptionId);
        }
        if (Array.isArray(data.updates)) {
          setUpdates(data.updates);
        }
        if (data.pageTexts && typeof data.pageTexts === "object") {
          setPageTexts(data.pageTexts);
        }
        if (data.pageColors && typeof data.pageColors === "object") {
          setPageColors(data.pageColors);
        }
        if (Array.isArray(data.presets)) {
          setPresets(data.presets);
        }
      })
      .catch(() => {
        // Fall back to localStorage if server unreachable
        const storedColor = localStorage.getItem("theme_primary_color") ?? DEFAULT_PRIMARY;
        const storedFont =
          (localStorage.getItem("theme_font_option") as FontOptionId) ?? "classic";
        const storedUpdates: SiteUpdate[] = JSON.parse(
          localStorage.getItem("site_updates") ?? "[]"
        );
        setPrimaryColor(storedColor);
        applyPrimaryToDom(storedColor);
        setFontState(storedFont);
        applyFontToDom(storedFont);
        setUpdates(storedUpdates);
      });
  }, []);

  const applyColor = (hex: string) => {
    setPrimaryColor(hex);
    applyPrimaryToDom(hex);
    localStorage.setItem("theme_primary_color", hex);
    const pw = localStorage.getItem("admin_password") ?? "password";
    syncToServer({ primaryColor: hex }, pw);
  };

  const saveColor = (hex: string) => {
    setSavedColors((prev) => {
      const updated = prev.includes(hex) ? prev : [hex, ...prev].slice(0, 24);
      localStorage.setItem("theme_saved_colors", JSON.stringify(updated));
      return updated;
    });
  };

  const removeColor = (hex: string) => {
    setSavedColors((prev) => {
      const updated = prev.filter((c) => c !== hex);
      localStorage.setItem("theme_saved_colors", JSON.stringify(updated));
      return updated;
    });
  };

  const setFontOptionId = (id: FontOptionId) => {
    setFontState(id);
    applyFontToDom(id);
    localStorage.setItem("theme_font_option", id);
    const pw = localStorage.getItem("admin_password") ?? "password";
    syncToServer({ fontOptionId: id }, pw);
  };

  const login = (username: string, password: string): boolean => {
    const pw = localStorage.getItem("admin_password") ?? "password";
    if (username === "master" && password === pw) {
      setIsAdmin(true);
      sessionStorage.setItem("admin_auth", "1");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setEditModeState(false);
    sessionStorage.removeItem("admin_auth");
  };

  const setEditMode = (v: boolean) => {
    if (v && !isAdmin) return;
    setEditModeState(v);
  };

  const updatePageText = (id: string, text: string) => {
    setPageTexts((prev) => {
      const updated = { ...prev, [id]: text };
      const pw = localStorage.getItem("admin_password") ?? "password";
      syncToServer({ pageTexts: updated }, pw);
      return updated;
    });
  };

  const resetPageText = (id: string) => {
    setPageTexts((prev) => {
      const updated = { ...prev };
      delete updated[id];
      const pw = localStorage.getItem("admin_password") ?? "password";
      syncToServer({ pageTexts: updated }, pw);
      return updated;
    });
  };

  const updatePageColor = (id: string, color: string) => {
    setPageColors((prev) => {
      const updated = { ...prev, [id]: color };
      const pw = localStorage.getItem("admin_password") ?? "password";
      syncToServer({ pageColors: updated }, pw);
      return updated;
    });
  };

  const resetPageColor = (id: string) => {
    setPageColors((prev) => {
      const updated = { ...prev };
      delete updated[id];
      const pw = localStorage.getItem("admin_password") ?? "password";
      syncToServer({ pageColors: updated }, pw);
      return updated;
    });
  };

  const savePreset = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const preset: ThemePreset = {
      id: Date.now().toString(),
      name: trimmed,
      primaryColor,
      fontOptionId,
      pageTexts: { ...pageTexts },
      pageColors: { ...pageColors },
      createdAt: new Date().toISOString(),
    };
    setPresets((prev) => {
      const updated = [preset, ...prev];
      const pw = localStorage.getItem("admin_password") ?? "password";
      syncToServer({ presets: updated }, pw);
      return updated;
    });
  };

  const applyPreset = (id: string) => {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    // apply locally
    setPrimaryColor(p.primaryColor);
    applyPrimaryToDom(p.primaryColor);
    setFontState(p.fontOptionId as FontOptionId);
    applyFontToDom(p.fontOptionId as FontOptionId);
    setPageTexts(p.pageTexts ?? {});
    setPageColors(p.pageColors ?? {});
    localStorage.setItem("theme_primary_color", p.primaryColor);
    localStorage.setItem("theme_font_option", p.fontOptionId);
    const pw = localStorage.getItem("admin_password") ?? "password";
    syncToServer(
      {
        primaryColor: p.primaryColor,
        fontOptionId: p.fontOptionId,
        pageTexts: p.pageTexts ?? {},
        pageColors: p.pageColors ?? {},
      },
      pw
    );
  };

  const deletePreset = (id: string) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      const pw = localStorage.getItem("admin_password") ?? "password";
      syncToServer({ presets: updated }, pw);
      return updated;
    });
  };

  const setAdminPassword = (pw: string) => {
    const oldPw = localStorage.getItem("admin_password") ?? "password";
    setAdminPw(pw);
    localStorage.setItem("admin_password", pw);
    syncToServer({ newAdminPassword: pw }, oldPw);
  };

  const addUpdate = (title: string, content: string) => {
    const update: SiteUpdate = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString(),
    };
    setUpdates((prev) => {
      const updated = [update, ...prev];
      localStorage.setItem("site_updates", JSON.stringify(updated));
      const pw = localStorage.getItem("admin_password") ?? "password";
      syncToServer({ updates: updated }, pw);
      return updated;
    });
  };

  const deleteUpdate = (id: string) => {
    setUpdates((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      localStorage.setItem("site_updates", JSON.stringify(updated));
      const pw = localStorage.getItem("admin_password") ?? "password";
      syncToServer({ updates: updated }, pw);
      return updated;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        applyColor,
        savedColors,
        saveColor,
        removeColor,
        fontOptionId,
        setFontOptionId,
        isAdmin,
        login,
        logout,
        adminPassword,
        setAdminPassword,
        updates,
        addUpdate,
        deleteUpdate,
        editMode,
        setEditMode,
        pageTexts,
        updatePageText,
        resetPageText,
        pageColors,
        updatePageColor,
        resetPageColor,
        presets,
        savePreset,
        applyPreset,
        deletePreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
