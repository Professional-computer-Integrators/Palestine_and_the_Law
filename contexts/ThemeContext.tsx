"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { DEFAULT_PRIMARY, DEFAULT_FONT_OPTION, FONT_OPTIONS, primaryCssVars, fontCssVars, type FontOptionId } from "@/lib/themeOptions";
import type { SharedSettings } from "@/lib/settings";

export { DEFAULT_PRIMARY, FONT_OPTIONS };
export type { FontOptionId };

export interface SiteUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  /** Where the insight came from, e.g. "BBC News" */
  source?: string;
  /** Link to the original article */
  sourceUrl?: string;
  /** Thumbnail image URL shown alongside the insight */
  thumbnail?: string;
}

/** Optional source details an admin can attach to an insight. */
export type InsightSourceFields = Pick<SiteUpdate, "source" | "sourceUrl" | "thumbnail">;

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
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  updates: SiteUpdate[];
  addUpdate: (title: string, content: string, extra?: InsightSourceFields) => void;
  editUpdate: (id: string, changes: Partial<Omit<SiteUpdate, "id" | "date">>) => void;
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
  fontOptionId: DEFAULT_FONT_OPTION,
  setFontOptionId: () => {},
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  updates: [],
  addUpdate: () => {},
  editUpdate: () => {},
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

function applyThemeVarsToDom(vars: Record<string, string>) {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
}

const applyPrimaryToDom = (hex: string) => applyThemeVarsToDom(primaryCssVars(hex));
const applyFontToDom = (id: FontOptionId) => applyThemeVarsToDom(fontCssVars(id));

/* ─── helper to POST settings to server ────────────────────────── */
async function syncToServer(
  payload: Record<string, unknown>
) {
  try {
    await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // silently fail — changes already applied in-memory
  }
}

/** Settings the server already rendered into the page (see app/layout.tsx),
 *  used as the starting state so the first paint matches the saved theme. */
export type InitialThemeSettings = Pick<
  SharedSettings,
  "primaryColor" | "fontOptionId" | "updates" | "pageTexts" | "pageColors"
>;

export function ThemeProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: InitialThemeSettings;
}) {
  const [primaryColor, setPrimaryColor] = useState(initialSettings?.primaryColor ?? DEFAULT_PRIMARY);
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [fontOptionId, setFontState] = useState<FontOptionId>(
    (initialSettings?.fontOptionId as FontOptionId) ?? DEFAULT_FONT_OPTION
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [updates, setUpdates] = useState<SiteUpdate[]>(initialSettings?.updates ?? []);
  const [editMode, setEditModeState] = useState(false);
  const [pageTexts, setPageTexts] = useState<Record<string, string>>(initialSettings?.pageTexts ?? {});
  const [pageColors, setPageColors] = useState<Record<string, string>>(initialSettings?.pageColors ?? {});
  const [presets, setPresets] = useState<ThemePreset[]>([]);

  useEffect(() => {
    // Load per-admin localStorage preferences as a fallback until shared
    // settings are fetched from /api/settings.
    const storedSaved: string[] = JSON.parse(
      localStorage.getItem("theme_saved_colors") ?? "[]"
    );
    setSavedColors(storedSaved);

    fetch("/api/admin/auth", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { isAdmin?: boolean }) => setIsAdmin(data.isAdmin === true))
      .catch(() => setIsAdmin(false));

    // Fetch shared settings from server (source of truth for all users)
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.primaryColor) {
          setPrimaryColor(data.primaryColor);
          applyPrimaryToDom(data.primaryColor);
        }
        if (Array.isArray(data.savedColors)) {
          setSavedColors(data.savedColors);
          localStorage.setItem("theme_saved_colors", JSON.stringify(data.savedColors));
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
          (localStorage.getItem("theme_font_option") as FontOptionId) ?? DEFAULT_FONT_OPTION;
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
    syncToServer({ primaryColor: hex });
  };

  const saveColor = (hex: string) => {
    setSavedColors((prev) => {
      const updated = prev.includes(hex) ? prev : [hex, ...prev].slice(0, 24);
      localStorage.setItem("theme_saved_colors", JSON.stringify(updated));
      syncToServer({ savedColors: updated });
      return updated;
    });
  };

  const removeColor = (hex: string) => {
    setSavedColors((prev) => {
      const updated = prev.filter((c) => c !== hex);
      localStorage.setItem("theme_saved_colors", JSON.stringify(updated));
      syncToServer({ savedColors: updated });
      return updated;
    });
  };

  const setFontOptionId = (id: FontOptionId) => {
    setFontState(id);
    applyFontToDom(id);
    localStorage.setItem("theme_font_option", id);
    syncToServer({ fontOptionId: id });
  };

  const login = async (password: string): Promise<boolean> => {
    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) return false;
    setIsAdmin(true);
    return true;
  };

  const logout = () => {
    void fetch("/api/admin/auth", { method: "DELETE" });
    setIsAdmin(false);
    setEditModeState(false);
  };

  const setEditMode = (v: boolean) => {
    if (v && !isAdmin) return;
    setEditModeState(v);
  };

  const updatePageText = (id: string, text: string) => {
    setPageTexts((prev) => {
      const updated = { ...prev, [id]: text };
      syncToServer({ pageTexts: updated });
      return updated;
    });
  };

  const resetPageText = (id: string) => {
    setPageTexts((prev) => {
      const updated = { ...prev };
      delete updated[id];
      syncToServer({ pageTexts: updated });
      return updated;
    });
  };

  const updatePageColor = (id: string, color: string) => {
    setPageColors((prev) => {
      const updated = { ...prev, [id]: color };
      syncToServer({ pageColors: updated });
      return updated;
    });
  };

  const resetPageColor = (id: string) => {
    setPageColors((prev) => {
      const updated = { ...prev };
      delete updated[id];
      syncToServer({ pageColors: updated });
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
      syncToServer({ presets: updated });
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
    syncToServer(
      {
        primaryColor: p.primaryColor,
        fontOptionId: p.fontOptionId,
        pageTexts: p.pageTexts ?? {},
        pageColors: p.pageColors ?? {},
      }
    );
  };

  const deletePreset = (id: string) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      syncToServer({ presets: updated });
      return updated;
    });
  };

  const addUpdate = (title: string, content: string, extra: InsightSourceFields = {}) => {
    const update: SiteUpdate = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString(),
      ...extra,
    };
    setUpdates((prev) => {
      const updated = [update, ...prev];
      localStorage.setItem("site_updates", JSON.stringify(updated));
      syncToServer({ updates: updated });
      return updated;
    });
  };

  const editUpdate = (id: string, changes: Partial<Omit<SiteUpdate, "id" | "date">>) => {
    setUpdates((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...changes } : u));
      localStorage.setItem("site_updates", JSON.stringify(updated));
      syncToServer({ updates: updated });
      return updated;
    });
  };

  const deleteUpdate = (id: string) => {
    setUpdates((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      localStorage.setItem("site_updates", JSON.stringify(updated));
      syncToServer({ updates: updated });
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
        updates,
        addUpdate,
        editUpdate,
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
