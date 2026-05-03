"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/ThemeContext";

interface EditableTextProps {
  /** Unique key used to store the override in pageTexts */
  id: string;
  /** Fallback text rendered when no override is saved */
  defaultText: string;
  /** HTML tag to render the text inside (default: "p") */
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  /** Human-readable label shown in the edit modal title */
  label?: string;
}

export default function EditableText({
  id,
  defaultText,
  tag: Tag = "p",
  className,
  label,
}: EditableTextProps) {
  const {
    isAdmin,
    editMode,
    pageTexts,
    updatePageText,
    resetPageText,
    pageColors,
    updatePageColor,
    resetPageColor,
  } = useTheme();

  const text = pageTexts[id] ?? defaultText;
  const isOverridden = id in pageTexts;
  const color = pageColors[id];
  const isColorOverridden = id in pageColors;

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(text);
  const [colorDraft, setColorDraft] = useState(color ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Keep drafts in sync when modal is closed */
  useEffect(() => {
    if (!modalOpen) {
      setDraft(text);
      setColorDraft(color ?? "");
    }
  }, [text, color, modalOpen]);

  /* Focus textarea when modal opens */
  useEffect(() => {
    if (modalOpen) setTimeout(() => textareaRef.current?.focus(), 60);
  }, [modalOpen]);

  function handleSave() {
    updatePageText(id, draft.trim() || defaultText);
    const c = colorDraft.trim();
    if (c && /^#[0-9a-fA-F]{6}$/.test(c)) {
      updatePageColor(id, c);
    } else if (!c && isColorOverridden) {
      resetPageColor(id);
    }
    setModalOpen(false);
  }

  function handleReset() {
    resetPageText(id);
    resetPageColor(id);
    setModalOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setModalOpen(false);
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSave();
  }

  /* ── Edit-mode wrapper ─────────────────────────────────────────── */
  if (isAdmin && editMode) {
    return (
      <>
        <Tag
          className={className}
          onClick={(e: React.MouseEvent) => {
            // Prevent navigation when wrapped in a <Link> / <a>
            e.preventDefault();
            e.stopPropagation();
            setDraft(text);
            setColorDraft(color ?? "");
            setModalOpen(true);
          }}
          style={{
            outline: "2px dashed rgba(58,100,200,0.55)",
            outlineOffset: "3px",
            cursor: "pointer",
            borderRadius: "2px",
            position: "relative",
            ...(color ? { color } : {}),
          }}
          title={`Click to edit: ${label ?? id}`}
        >
          {text}
          {/* Pencil badge */}
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              marginLeft: "8px",
              padding: "1px 6px",
              borderRadius: "4px",
              fontSize: "10px",
              fontFamily: "inherit",
              fontWeight: 600,
              letterSpacing: "0.04em",
              background: "rgba(58,100,200,0.15)",
              color: "rgba(58,100,200,0.8)",
              border: "1px solid rgba(58,100,200,0.3)",
              verticalAlign: "middle",
              lineHeight: "16px",
              whiteSpace: "nowrap",
            }}
          >
            ✏ edit
          </span>
        </Tag>

        {/* Edit modal */}
        {mounted && modalOpen &&
          createPortal(
            <div
              onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                background: "rgba(8,18,36,0.75)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "540px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "linear-gradient(175deg,#1b3556 0%,#111e30 55%,#0d1926 100%)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
                }}
              >
                {/* Gold bar */}
                <div style={{ height: 3, background: "linear-gradient(90deg,#9e7530,#e0b060,#9e7530)" }} />

                <div style={{ padding: "24px 28px 28px" }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                    <div>
                      <p style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, color: "#deeaf6", lineHeight: 1.2 }}>
                        Edit Text
                      </p>
                      <p style={{ fontFamily: "inherit", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(200,220,238,0.4)", marginTop: 3 }}>
                        {label ?? id}
                      </p>
                    </div>
                    <button
                      onClick={() => setModalOpen(false)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", background: "transparent", color: "rgba(220,234,246,0.35)", fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#deeaf6")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(220,234,246,0.35)")}
                      aria-label="Close"
                    >×</button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={6}
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      lineHeight: "1.65",
                      outline: "none",
                      background: "rgba(255,255,255,0.055)",
                      border: "1px solid rgba(85,133,180,0.55)",
                      color: "#deeaf6",
                      resize: "vertical",
                      boxSizing: "border-box",
                      marginBottom: "14px",
                    }}
                  />

                  <p style={{ fontFamily: "inherit", fontSize: 10, color: "rgba(200,220,238,0.32)", marginBottom: "16px", letterSpacing: "0.03em" }}>
                    Ctrl+Enter to save · Esc to cancel
                  </p>

                  {/* Color picker */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontFamily: "inherit", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(200,220,238,0.5)", marginBottom: 8 }}>
                      Text Colour
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="color"
                        value={colorDraft && /^#[0-9a-fA-F]{6}$/.test(colorDraft) ? colorDraft : "#000000"}
                        onChange={(e) => setColorDraft(e.target.value)}
                        style={{ width: 44, height: 36, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 6, background: "transparent", cursor: "pointer", padding: 2 }}
                      />
                      <input
                        type="text"
                        value={colorDraft}
                        onChange={(e) => setColorDraft(e.target.value)}
                        placeholder="#000000 (leave blank for default)"
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.055)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#deeaf6",
                          borderRadius: 6,
                          padding: "8px 12px",
                          fontFamily: "inherit",
                          fontSize: 13,
                          outline: "none",
                        }}
                      />
                      {colorDraft && (
                        <button
                          onClick={() => setColorDraft("")}
                          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(220,234,246,0.65)", fontSize: 11, padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
                          title="Clear colour override"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleSave}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 6, border: "none", cursor: "pointer", background: "rgb(var(--color-primary))", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--color-primary-light))")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(var(--color-primary))")}
                    >Save Changes</button>
                    {isOverridden && (
                      <button
                        onClick={handleReset}
                        style={{ padding: "10px 14px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", fontFamily: "inherit", fontSize: 12, transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="Restore original text"
                      >Reset</button>
                    )}
                    <button
                      onClick={() => setModalOpen(false)}
                      style={{ padding: "10px 14px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(220,234,246,0.55)", fontFamily: "inherit", fontSize: 13, transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        }
      </>
    );
  }

  /* ── Normal render ─────────────────────────────────────────────── */
  return (
    <Tag className={className} style={color ? { color } : undefined}>
      {text}
    </Tag>
  );
}
/**
 * Light-weight read-only hook for places where wrapping in <EditableText>
 * isn't practical (e.g. label text inside a Link or button). The text is
 * still controlled by the admin via the Content tab (using its `id`).
 */
export function useEditableText(id: string, defaultText: string) {
  const { pageTexts, pageColors } = useTheme();
  return {
    text: pageTexts[id] ?? defaultText,
    color: pageColors[id],
  };
}