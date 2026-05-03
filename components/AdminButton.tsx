"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme, FONT_OPTIONS, FontOptionId, DEFAULT_PRIMARY } from "@/contexts/ThemeContext";

/* ─── Portal helper ─────────────────────────────────────────────── */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* ─── helpers ──────────────────────────────────────────────────── */
const isValidHex = (h: string) => /^#[0-9a-fA-F]{6}$/.test(h);
const normalise  = (v: string) => (v.startsWith("#") ? v : `#${v}`);

/* ─── icons ─────────────────────────────────────────────────────── */
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ─── panel bg / shared css-in-js tokens ────────────────────────── */
const PANEL_BG    = "linear-gradient(175deg,#1b3556 0%,#111e30 55%,#0d1926 100%)";
const PANEL_BORDER = "1px solid rgba(255,255,255,0.09)";
const INPUT_STYLE: React.CSSProperties = {
  width: "100%", borderRadius: "6px", padding: "10px 14px",
  fontFamily: "inherit", fontSize: "13px", outline: "none",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#deeaf6", transition: "border-color 0.15s",
};
const focusOn  = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) =>
  (e.currentTarget.style.borderColor = "rgba(85,133,180,0.65)");
const focusOff = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) =>
  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)");

/* ─── small helpers ─────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "inherit", fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em",
      textTransform: "uppercase", marginBottom: "10px", color: "rgba(176,206,232,0.45)" }}>
      {children}
    </p>
  );
}

function PrimaryBtn({ children, onClick, type = "button" }: { children: React.ReactNode; onClick?: () => void; type?: "button"|"submit" }) {
  return (
    <button type={type} onClick={onClick}
      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer",
        background: "rgb(var(--color-primary))", color: "#fff",
        fontFamily: "inherit", fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em",
        transition: "background 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--color-primary-light))")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(var(--color-primary))")}
    >{children}</button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PRESETS PANEL — save / apply / delete named theme snapshots
═══════════════════════════════════════════════════════════════════ */
function PresetsPanel({
  presets,
  savePreset,
  applyPreset,
  deletePreset,
  primaryColor,
  fontOptionId,
  pageTextsCount,
  pageColorsCount,
}: {
  presets: import("@/contexts/ThemeContext").ThemePreset[];
  savePreset: (name: string) => void;
  applyPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  primaryColor: string;
  fontOptionId: string;
  pageTextsCount: number;
  pageColorsCount: number;
}) {
  const [name, setName] = useState("");
  const fontLabel = FONT_OPTIONS.find((f) => f.id === fontOptionId)?.label ?? fontOptionId;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    savePreset(name.trim());
    setName("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <SectionLabel>Save Current Look</SectionLabel>
        <p style={{ fontFamily: "inherit", fontSize: 12, color: "rgba(200,220,238,0.48)", lineHeight: 1.6, marginBottom: 12 }}>
          A preset captures the current colour, font, all text overrides and all
          colour overrides as a named snapshot. Apply it later with one click.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 7, marginBottom: 12, fontSize: 11, color: "rgba(200,220,238,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: primaryColor, border: "1px solid rgba(255,255,255,0.18)" }} />
            <span style={{ fontFamily: "monospace" }}>{primaryColor}</span>
            <span style={{ marginLeft: "auto", color: "rgba(200,220,238,0.4)" }}>colour</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fontLabel}</span>
            <span style={{ color: "rgba(200,220,238,0.4)" }}>font</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{pageTextsCount} text · {pageColorsCount} colour overrides</span>
            <span style={{ color: "rgba(200,220,238,0.4)" }}>edits</span>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Preset name (e.g. Classic Forest)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={focusOn}
            onBlur={focusOff}
            style={{ ...INPUT_STYLE, flex: 1 }}
            required
          />
          <button type="submit"
            style={{ flexShrink: 0, padding: "0 16px", borderRadius: 6, cursor: "pointer",
              fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "rgba(200,151,63,0.18)", border: "1px solid rgba(200,151,63,0.4)",
              color: "#e0b060", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,151,63,0.32)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(200,151,63,0.18)")}
          >Save</button>
        </form>
      </div>

      <div>
        <SectionLabel>Saved Presets ({presets.length})</SectionLabel>
        {presets.length === 0 ? (
          <p style={{ fontFamily: "inherit", fontSize: 12, color: "rgba(200,220,238,0.4)", lineHeight: 1.55,
            padding: "14px 12px", borderRadius: 7, background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.10)" }}>
            No presets saved yet. Customise the site, then save a snapshot above.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {presets.map((p) => {
              const fontLabel2 = FONT_OPTIONS.find((f) => f.id === p.fontOptionId)?.label ?? p.fontOptionId;
              return (
                <div key={p.id}
                  style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px",
                    borderRadius: 8, background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 5, flexShrink: 0,
                      background: p.primaryColor, border: "1px solid rgba(255,255,255,0.20)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 600,
                        color: "#deeaf6", lineHeight: 1.2 }}>{p.name}</p>
                      <p style={{ fontFamily: "inherit", fontSize: 10, color: "rgba(200,220,238,0.4)",
                        marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {fontLabel2} · {Object.keys(p.pageTexts ?? {}).length} text · {Object.keys(p.pageColors ?? {}).length} colour
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => applyPreset(p.id)}
                      style={{ flex: 1, padding: "7px 0", borderRadius: 5, border: "none",
                        cursor: "pointer", background: "rgb(var(--color-primary))", color: "#fff",
                        fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                        letterSpacing: "0.05em", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--color-primary-light))")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(var(--color-primary))")}
                    >Apply</button>
                    <button onClick={() => {
                        if (window.confirm(`Delete preset "${p.name}"?`)) deletePreset(p.id);
                      }}
                      style={{ padding: "7px 12px", borderRadius: 5, cursor: "pointer",
                        background: "transparent", border: "1px solid rgba(239,68,68,0.3)",
                        color: "#fca5a5", fontFamily: "inherit", fontSize: 11, transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN MODAL
═══════════════════════════════════════════════════════════════════ */
function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { login } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login(username, password)) { onClose(); onSuccess(); }
    else { setError("Incorrect username or password."); }
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex",
        alignItems: "center", justifyContent: "center", padding: "16px",
        background: "rgba(8,18,36,0.80)", backdropFilter: "blur(7px)" }}
    >
      <div style={{ width: "100%", maxWidth: "360px", borderRadius: "12px", overflow: "hidden",
        background: PANEL_BG, border: PANEL_BORDER, boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>

        {/* Gold bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#9e7530,#e0b060,#9e7530)" }} />

        <div style={{ padding: "32px 32px 36px" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(58,100,145,0.3)", border: "1px solid rgba(85,133,180,0.4)", color: "#deeaf6" }}>
              <LockIcon />
            </div>
            <div>
              <p style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: "#deeaf6", lineHeight: 1.2 }}>Admin Login</p>
              <p style={{ fontFamily: "inherit", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
                color: "rgba(200,220,238,0.4)", marginTop: 2 }}>Restricted access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontFamily: "inherit", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(200,220,238,0.5)",
                marginBottom: 6 }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                onFocus={focusOn} onBlur={focusOff}
                style={INPUT_STYLE} placeholder="Enter username" autoComplete="username" required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontFamily: "inherit", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", color: "rgba(200,220,238,0.5)", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                onFocus={focusOn} onBlur={focusOff}
                style={INPUT_STYLE} placeholder="Enter password" autoComplete="current-password" required />
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: "8px 12px", borderRadius: 6, fontSize: 12,
                color: "#fca5a5", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.28)" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit"
                style={{ flex: 1, padding: "10px 0", borderRadius: 6, border: "none", cursor: "pointer",
                  background: "rgb(var(--color-primary))", color: "#fff",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--color-primary-light))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(var(--color-primary))")}
              >Sign in</button>
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: "10px 0", borderRadius: 6, cursor: "pointer",
                  background: "transparent", border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(220,234,246,0.55)", fontFamily: "inherit", fontSize: 13 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ADMIN PANEL (right sidebar)
═══════════════════════════════════════════════════════════════════ */
function AdminPanel({ onClose }: { onClose: () => void }) {
  const {
    primaryColor, applyColor, savedColors, saveColor, removeColor,
    fontOptionId, setFontOptionId,
    logout, setAdminPassword,
    addUpdate, updates, deleteUpdate,
    editMode, setEditMode, pageTexts, resetPageText,
    pageColors, resetPageColor,
    presets, savePreset, applyPreset, deletePreset,
  } = useTheme();

  const [tab, setTab] = useState<"colour" | "font" | "insights" | "content" | "presets" | "settings">("colour");

  // Colour state
  const [pickerHex, setPickerHex] = useState(primaryColor);
  const [hexInput,  setHexInput]  = useState(primaryColor);
  const [hexError,  setHexError]  = useState(false);

  // Insights state
  const [uTitle, setUTitle]     = useState("");
  const [uContent, setUContent] = useState("");

  // Settings state
  const [newPw, setNewPw]                                       = useState("");
  const [pwMsg, setPwMsg] = useState<{ok:boolean;text:string}|null>(null);

  useEffect(() => { setPickerHex(primaryColor); setHexInput(primaryColor); }, [primaryColor]);

  const applyHex = (hex: string) => {
    setPickerHex(hex); setHexInput(hex); setHexError(false); applyColor(hex);
  };
  const handleHexInput = (val: string) => {
    setHexInput(val);
    const n = normalise(val);
    if (isValidHex(n)) { setHexError(false); applyHex(n); } else setHexError(true);
  };
  const handleSaveColor = () => saveColor(isValidHex(hexInput) ? hexInput : pickerHex);

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uTitle.trim() || !uContent.trim()) return;
    addUpdate(uTitle.trim(), uContent.trim());
    setUTitle(""); setUContent("");
  };
  const handleChangePw = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 4) { setPwMsg({ ok: false, text: "Minimum 4 characters required." }); return; }
    setAdminPassword(newPw); setNewPw("");
    setPwMsg({ ok: true, text: "Password updated." });
    setTimeout(() => setPwMsg(null), 4000);
  };

  const TABS = [
    { id: "colour",   label: "Colour"   },
    { id: "font",     label: "Font"     },
    { id: "content",  label: "Content"  },
    { id: "presets",  label: "Presets"  },
    { id: "insights", label: "Insights" },
    { id: "settings", label: "Settings" },
  ] as const;

  return (
    <div style={{ position: "fixed", top: 0, right: 0, zIndex: 150, height: "100dvh",
      width: "380px", maxWidth: "100vw", display: "flex", flexDirection: "column",
      background: PANEL_BG, borderLeft: PANEL_BORDER,
      boxShadow: "-10px 0 50px rgba(0,0,0,0.5)" }}>

      {/* Gold bar */}
      <div style={{ height: 3, flexShrink: 0, background: "linear-gradient(90deg,#9e7530,#e0b060,#9e7530)" }} />

      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(58,100,145,0.35)", border: "1px solid rgba(85,133,180,0.4)", color: "#deeaf6" }}>
            <ShieldIcon />
          </div>
          <div>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: "#deeaf6", lineHeight: 1.2 }}>
              Admin Panel</p>
            <p style={{ fontFamily: "inherit", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "rgba(200,220,238,0.38)", marginTop: 1 }}>Site Manager</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => { logout(); onClose(); }}
            style={{ fontFamily: "inherit", fontSize: 11, padding: "5px 10px", borderRadius: 5, cursor: "pointer",
              background: "transparent", border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(220,234,246,0.5)", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >Logout</button>
          <button onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
              background: "transparent", color: "rgba(220,234,246,0.35)", display: "flex",
              alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#deeaf6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(220,234,246,0.35)")}
            aria-label="Close panel"
          ><XIcon /></button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ flexShrink: 0, display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "11px 0", fontFamily: "inherit", fontSize: 11, fontWeight: active ? 600 : 400,
                letterSpacing: "0.06em", border: "none", cursor: "pointer", background: "transparent",
                color: active ? "#c8973f" : "rgba(200,220,238,0.42)",
                borderBottom: active ? "2px solid #c8973f" : "2px solid transparent",
                transition: "color 0.15s, border-color 0.15s" }}
            >{t.label}</button>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 20px",
        scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>

        {/* ── COLOUR ── */}
        {tab === "colour" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <SectionLabel>Primary Colour</SectionLabel>

              {/* Colour picker swatch (large clickable) */}
              <label style={{ display: "block", position: "relative", cursor: "pointer", borderRadius: 8,
                overflow: "hidden", height: 88, marginBottom: 14,
                border: "2px solid rgba(255,255,255,0.13)" }}
                className="group"
              >
                <input type="color" value={pickerHex}
                  onChange={(e) => applyHex(e.target.value)}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                />
                {/* Gradient preview */}
                <div style={{ position: "absolute", inset: 0, transition: "opacity 0.2s",
                  background: `linear-gradient(120deg, rgb(var(--color-primary-dark)), ${pickerHex}, rgb(var(--color-primary-light)))` }} />
                {/* Hover hint */}
                <div className="opacity-0 group-hover:opacity-100"
                  style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s" }}>
                  <span style={{ fontFamily: "inherit", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)",
                    letterSpacing: "0.06em" }}>Click to open colour picker</span>
                </div>
                {/* Hex badge */}
                <div style={{ position: "absolute", bottom: 8, right: 10, fontFamily: "monospace", fontSize: 12,
                  padding: "2px 8px", borderRadius: 4, background: "rgba(0,0,0,0.45)", color: "#fff",
                  backdropFilter: "blur(4px)", letterSpacing: "0.04em" }}>{pickerHex}</div>
              </label>

              {/* Hex input + Save row */}
              <div style={{ display: "flex", gap: 8, marginBottom: hexError ? 6 : 0 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    fontFamily: "monospace", fontSize: 13, color: "rgba(200,220,238,0.3)" }}>#</span>
                  <input
                    type="text"
                    value={hexInput.replace(/^#/, "")}
                    onChange={(e) => handleHexInput(`#${e.target.value}`)}
                    onFocus={focusOn} onBlur={focusOff}
                    maxLength={6} spellCheck={false} placeholder="3a6491"
                    style={{ ...INPUT_STYLE, paddingLeft: 26,
                      borderColor: hexError ? "#f87171" : "rgba(255,255,255,0.12)",
                      fontFamily: "monospace" }}
                  />
                </div>
                <button onClick={handleSaveColor}
                  style={{ flexShrink: 0, padding: "0 16px", borderRadius: 6, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", transition: "background 0.15s",
                    background: "rgba(200,151,63,0.18)", border: "1px solid rgba(200,151,63,0.4)",
                    color: "#e0b060" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,151,63,0.32)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(200,151,63,0.18)")}
                  title="Save current colour to history"
                >Save</button>
                <button onClick={() => applyHex(DEFAULT_PRIMARY)}
                  style={{ flexShrink: 0, padding: "0 14px", borderRadius: 6, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", transition: "background 0.15s",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(220,234,246,0.6)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  title={`Reset to default colour (${DEFAULT_PRIMARY})`}
                >Reset</button>
              </div>
              {hexError && (
                <p style={{ fontFamily: "inherit", fontSize: 11, color: "#fca5a5", marginTop: 4, marginBottom: 4 }}>
                  Enter a valid 6-digit hex code</p>
              )}

              {/* Shade strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, borderRadius: 6,
                overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)", marginTop: 12 }}>
                {[
                  { label: "Dark",  bg: "rgb(var(--color-primary-dark))" },
                  { label: "Main",  bg: "rgb(var(--color-primary))" },
                  { label: "Light", bg: "rgb(var(--color-primary-light))" },
                ].map((s) => (
                  <div key={s.label} style={{ height: 32, background: s.bg,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "inherit", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.7)",
                      letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Colour history */}
            {savedColors.length > 0 && (
              <div>
                <SectionLabel>Colour History ({savedColors.length})</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                  {savedColors.map((color) => (
                    <div key={color} style={{ position: "relative", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 3 }} className="group">
                      <button onClick={() => applyHex(color)} title={`Apply ${color}`}
                        style={{ width: "100%", aspectRatio: "1/1", borderRadius: 6, cursor: "pointer",
                          background: color, border: color === primaryColor
                            ? "2px solid #e0b060" : "1px solid rgba(255,255,255,0.18)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.35)", transition: "transform 0.1s, box-shadow 0.1s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.35)"; }}
                      />
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(200,220,238,0.4)",
                        maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {color}
                      </span>
                      <button onClick={() => removeColor(color)}
                        className="opacity-0 group-hover:opacity-100"
                        style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16,
                          borderRadius: "50%", border: "none", cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800,
                          background: "#ef4444", color: "#fff", lineHeight: 1, transition: "opacity 0.1s" }}
                        title="Remove">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FONT ── */}
        {tab === "font" && (
          <div>
            <SectionLabel>Typography Preset</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FONT_OPTIONS.map((opt) => {
                const active = fontOptionId === opt.id;
                return (
                  <label key={opt.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      borderRadius: 8, cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
                      background: active ? "rgba(58,100,145,0.25)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? "rgba(85,133,180,0.5)" : "rgba(255,255,255,0.09)"}` }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  >
                    {/* Custom radio circle */}
                    <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${active ? "#c8973f" : "rgba(255,255,255,0.28)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c8973f" }} />}
                    </div>
                    <input type="radio" name="fontOpt" value={opt.id}
                      checked={active} onChange={() => setFontOptionId(opt.id as FontOptionId)}
                      style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                    <span style={{ fontFamily: "inherit", fontSize: 13,
                      color: active ? "#deeaf6" : "rgba(200,220,238,0.58)" }}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {tab === "insights" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <SectionLabel>Post New Insight</SectionLabel>
              <form onSubmit={handlePostUpdate} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="text" placeholder="Insight title…" value={uTitle}
                  onChange={(e) => setUTitle(e.target.value)}
                  onFocus={focusOn} onBlur={focusOff}
                  style={INPUT_STYLE} required />
                <textarea placeholder="Insight content…" value={uContent}
                  onChange={(e) => setUContent(e.target.value)}
                  onFocus={focusOn} onBlur={focusOff}
                  rows={4} style={{ ...INPUT_STYLE, resize: "none" }} required />
                <PrimaryBtn type="submit">Publish Insight</PrimaryBtn>
              </form>
            </div>

            {updates.length > 0 && (
              <div>
                <SectionLabel>Published ({updates.length})</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {updates.map((u) => (
                    <div key={u.id}
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                        borderRadius: 7, background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                          color: "#deeaf6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {u.title}</p>
                        <p style={{ fontFamily: "inherit", fontSize: 11, color: "rgba(200,220,238,0.38)", marginTop: 2 }}>
                          {new Date(u.date).toLocaleDateString("en-GB",
                            { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                      <button onClick={() => deleteUpdate(u.id)}
                        style={{ flexShrink: 0, fontFamily: "inherit", fontSize: 11, padding: "4px 8px",
                          borderRadius: 4, cursor: "pointer", background: "transparent",
                          border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === "content" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <SectionLabel>Page Content Editor</SectionLabel>
              <p style={{ fontFamily: "inherit", fontSize: 12, color: "rgba(200,220,238,0.48)", lineHeight: 1.65, marginBottom: 16 }}>
                Toggle <span style={{ fontFamily: "monospace", color: "#e0b060" }}>Edit Mode</span> to highlight editable text sections on the page. Click any highlighted section to edit its content.
              </p>

              {/* Toggle button */}
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "background 0.15s, border-color 0.15s",
                  background: editMode ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${editMode ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.15)"}`,
                  color: editMode ? "#86efac" : "rgba(220,234,246,0.7)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = editMode ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = editMode ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)"; }}
              >
                {/* Toggle indicator */}
                <span style={{
                  display: "inline-block", width: 36, height: 20, borderRadius: 10, position: "relative", flexShrink: 0,
                  background: editMode ? "rgba(34,197,94,0.55)" : "rgba(255,255,255,0.15)",
                  border: `1px solid ${editMode ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.25)"}`,
                  transition: "background 0.2s",
                }}>
                  <span style={{
                    position: "absolute", top: 2, left: editMode ? 17 : 2, width: 14, height: 14,
                    borderRadius: "50%", background: editMode ? "#86efac" : "rgba(255,255,255,0.6)",
                    transition: "left 0.2s",
                  }} />
                </span>
                {editMode ? "Edit Mode: ON — Click text to edit" : "Edit Mode: OFF"}
              </button>

              {editMode && (
                <p style={{ fontFamily: "inherit", fontSize: 11, color: "rgba(134,239,172,0.65)", marginTop: 10, lineHeight: 1.55 }}>
                  ✓ Navigate to any page and click on a dashed blue outlined text to edit it.
                </p>
              )}
            </div>

            {/* Overridden texts list */}
            {Object.keys(pageTexts).length > 0 && (
              <div>
                <SectionLabel>Customised Text ({Object.keys(pageTexts).length})</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(pageTexts).map(([id, text]) => (
                    <div key={id}
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                        borderRadius: 7, background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "monospace", fontSize: 10, color: "#e0b060",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
                          {id}
                        </p>
                        <p style={{ fontFamily: "inherit", fontSize: 12, color: "rgba(200,220,238,0.55)",
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden", lineHeight: 1.45 }}>
                          {text}
                        </p>
                      </div>
                      <button onClick={() => resetPageText(id)}
                        style={{ flexShrink: 0, fontFamily: "inherit", fontSize: 11, padding: "4px 8px",
                          borderRadius: 4, cursor: "pointer", background: "transparent",
                          border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="Reset to default"
                      >Reset</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(pageColors).length > 0 && (
              <div>
                <SectionLabel>Customised Text Colours ({Object.keys(pageColors).length})</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(pageColors).map(([id, c]) => (
                    <div key={id}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                        borderRadius: 7, background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ width: 22, height: 22, borderRadius: 4, background: c, flexShrink: 0, border: "1px solid rgba(255,255,255,0.18)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "monospace", fontSize: 10, color: "#e0b060",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 1 }}>{id}</p>
                        <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(200,220,238,0.55)" }}>{c}</p>
                      </div>
                      <button onClick={() => resetPageColor(id)}
                        style={{ flexShrink: 0, fontFamily: "inherit", fontSize: 11, padding: "4px 8px",
                          borderRadius: 4, cursor: "pointer", background: "transparent",
                          border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >Reset</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PRESETS ── */}
        {tab === "presets" && <PresetsPanel
          presets={presets}
          savePreset={savePreset}
          applyPreset={applyPreset}
          deletePreset={deletePreset}
          primaryColor={primaryColor}
          fontOptionId={fontOptionId}
          pageTextsCount={Object.keys(pageTexts).length}
          pageColorsCount={Object.keys(pageColors).length}
        />}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div>
            <SectionLabel>Change Admin Password</SectionLabel>
            <p style={{ fontFamily: "inherit", fontSize: 12, color: "rgba(200,220,238,0.48)",
              lineHeight: 1.65, marginBottom: 16 }}>
              Username is always <span style={{ fontFamily: "monospace", color: "#e0b060" }}>master</span>.
              Set a new login password below (min. 4 characters).
            </p>
            <form onSubmit={handleChangePw} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="password" placeholder="New password…" value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                onFocus={focusOn} onBlur={focusOff}
                style={INPUT_STYLE} autoComplete="new-password" required />
              {pwMsg && (
                <p style={{ fontFamily: "inherit", fontSize: 12, padding: "8px 12px", borderRadius: 6,
                  color: pwMsg.ok ? "#86efac" : "#fca5a5",
                  background: pwMsg.ok ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
                  border: `1px solid ${pwMsg.ok ? "rgba(34,197,94,0.28)" : "rgba(239,68,68,0.28)"}` }}>
                  {pwMsg.text}
                </p>
              )}
              <PrimaryBtn type="submit">Update Password</PrimaryBtn>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.07)",
        textAlign: "center" }}>
        <p style={{ fontFamily: "inherit", fontSize: 10, color: "rgba(200,220,238,0.2)", letterSpacing: "0.06em" }}>
          Palestine and the Law — Site Administration
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORTED TRIGGER BUTTON
═══════════════════════════════════════════════════════════════════ */
export default function AdminButton() {
  const { isAdmin } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowPanel(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => isAdmin ? setShowPanel((v) => !v) : setShowLogin(true)}
        title={isAdmin ? "Admin Panel" : "Admin Login"}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
          borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 12,
          fontWeight: 500, transition: "background 0.15s",
          background: isAdmin ? "rgba(200,151,63,0.18)" : "rgba(255,255,255,0.08)",
          border: isAdmin ? "1px solid rgba(200,151,63,0.4)" : "1px solid rgba(255,255,255,0.16)",
          color: isAdmin ? "#e0b060" : "rgba(232,241,248,0.65)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isAdmin ? "rgba(200,151,63,0.28)" : "rgba(255,255,255,0.14)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isAdmin ? "rgba(200,151,63,0.18)" : "rgba(255,255,255,0.08)";
        }}
      >
        {isAdmin ? <ShieldIcon /> : <LockIcon />}
        Admin
      </button>

      {showLogin && !isAdmin && <Portal><LoginModal onClose={() => setShowLogin(false)} onSuccess={() => setShowPanel(true)} /></Portal>}
      {isAdmin && showPanel && <Portal><AdminPanel onClose={() => setShowPanel(false)} /></Portal>}
    </>
  );
}
