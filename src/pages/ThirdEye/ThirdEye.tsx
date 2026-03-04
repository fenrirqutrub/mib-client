// ThirdEye.tsx

import React, {
  useReducer,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "./ThirdEye.css";
import {
  appReducer,
  executeCode,
  formatCode,
  INITIAL_STATE,
  LANGUAGES,
  loadPrettier,
  loadPrism,
  loadPyodide,
  parseErrors,
  useDebounced,
  useHasSelection,
  useMediaQuery,
} from "./ThirdEyeLogic";
import { EditorContext } from "./Editorcontext";
import {
  DesktopTabs,
  FormatButton,
  FormatToast,
  MobileDropdown,
  RunButton,
} from "./TabsandButtons";
import type { EditorCtx } from "./ThirdEyeTypes";
import { OutputPanel } from "./Outputpanel";
import { Editor } from "./Syntaxhighlight";

// ═══════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════

const ThirdEye = () => {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const debouncedText = useDebounced(state.text, 600);
  const [showFormatToast, setShowFormatToast] = useState(false);
  const formatToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoFormatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFormattedText = useRef<string>("");
  const hasSelection = useHasSelection(textareaRef);

  // Restore persisted state
  useEffect(() => {
    const t = localStorage.getItem("thirdbrain-content");
    const l = localStorage.getItem("thirdbrain-lang");
    if (t) dispatch({ type: "SET_TEXT", payload: t });
    if (l) {
      const found = LANGUAGES.find((x) => x.value === l);
      if (found) dispatch({ type: "SET_LANG", payload: found });
    }
    textareaRef.current?.focus();
    loadPrism();
    loadPrettier();
  }, []);

  // Persist content
  useEffect(() => {
    if (debouncedText)
      localStorage.setItem("thirdbrain-content", debouncedText);
  }, [debouncedText]);

  // Preload Pyodide when Python is selected
  useEffect(() => {
    if (state.lang.value === "python" && state.pyStatus === "idle") {
      dispatch({ type: "SET_PY_STATUS", payload: "loading" });
      loadPyodide()
        .then(() => dispatch({ type: "SET_PY_STATUS", payload: "ready" }))
        .catch(() => dispatch({ type: "SET_PY_STATUS", payload: "idle" }));
    }
  }, [state.lang.value, state.pyStatus]);

  // Auto-format on pause (JS / TS)
  useEffect(() => {
    const lang = state.lang.value;
    if (lang !== "javascript" && lang !== "typescript") return;
    if (!state.text.trim() || state.text === lastFormattedText.current) return;
    if (autoFormatTimer.current) clearTimeout(autoFormatTimer.current);
    autoFormatTimer.current = setTimeout(async () => {
      const ta = textareaRef.current;
      const cursorPos = ta?.selectionStart ?? 0;
      const formatted = await formatCode(lang, state.text);
      if (
        !formatted ||
        state.text !== (textareaRef.current?.value ?? state.text)
      )
        return;
      lastFormattedText.current = formatted;
      dispatch({ type: "SET_TEXT", payload: formatted });
      requestAnimationFrame(() => {
        if (!ta) return;
        const p = Math.min(cursorPos, formatted.length);
        ta.setSelectionRange(p, p);
      });
    }, 1200);
    return () => {
      if (autoFormatTimer.current) clearTimeout(autoFormatTimer.current);
    };
  }, [state.text, state.lang.value]);

  // Manual format
  const onFormat = useCallback(async () => {
    if (state.formatting) return;
    dispatch({ type: "SET_FORMATTING", payload: true });
    const ta = textareaRef.current;
    const cursorPos = ta?.selectionStart ?? 0;
    try {
      const formatted = await formatCode(state.lang.value, state.text);
      if (formatted) {
        lastFormattedText.current = formatted;
        dispatch({ type: "SET_TEXT", payload: formatted });
        requestAnimationFrame(() => {
          if (!ta) return;
          const p = Math.min(cursorPos, formatted.length);
          ta.setSelectionRange(p, p);
        });
        if (formatToastTimer.current) clearTimeout(formatToastTimer.current);
        setShowFormatToast(true);
        formatToastTimer.current = setTimeout(
          () => setShowFormatToast(false),
          1800,
        );
      }
    } finally {
      dispatch({ type: "SET_FORMATTING", payload: false });
    }
  }, [state.formatting, state.lang.value, state.text]);

  // Run code
  const onRun = useCallback(async () => {
    if (state.lang.value === "text" || state.running || !state.text.trim())
      return;
    dispatch({ type: "SET_RUNNING", payload: true });
    dispatch({ type: "SET_ERRORS", payload: [] });
    dispatch({ type: "SET_OUTPUT", payload: { status: "loading", text: "" } });
    try {
      const { ok, text } = await executeCode(state.lang.value, state.text);
      dispatch({
        type: "SET_OUTPUT",
        payload: { status: ok ? "success" : "error", text },
      });
      if (!ok)
        dispatch({
          type: "SET_ERRORS",
          payload: parseErrors(text, state.lang.value),
        });
    } catch (err) {
      const errText = String(err);
      dispatch({
        type: "SET_OUTPUT",
        payload: { status: "error", text: errText },
      });
      dispatch({
        type: "SET_ERRORS",
        payload: parseErrors(errText, state.lang.value),
      });
    } finally {
      dispatch({ type: "SET_RUNNING", payload: false });
    }
  }, [state.lang.value, state.running, state.text]);

  const canRun = useMemo(
    () =>
      state.lang.value !== "text" &&
      !state.running &&
      state.text.trim().length > 0,
    [state.lang.value, state.running, state.text],
  );

  const ctxValue = useMemo<EditorCtx>(
    () => ({ state, dispatch, onRun, onFormat, canRun, hasSelection }),
    [state, dispatch, onRun, onFormat, canRun, hasSelection],
  );

  return (
    <EditorContext.Provider value={ctxValue}>
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        {/* Desktop layout */}
        {isDesktop && (
          <div className="flex flex-1 min-h-screen pt-20">
            <DesktopTabs />
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <Editor textareaRef={textareaRef} outputOpen={!!state.output} />
            </div>
            <div className="flex flex-col pt-20 px-4 gap-2 flex-shrink-0">
              <RunButton />
              <FormatButton />
            </div>
          </div>
        )}

        {/* Mobile layout */}
        {!isDesktop && (
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between gap-2 px-4 pt-20 pb-3">
              <MobileDropdown />
              <div className="flex items-center gap-2">
                <FormatButton />
                <RunButton />
              </div>
            </div>
            <Editor textareaRef={textareaRef} outputOpen={!!state.output} />
          </div>
        )}

        <OutputPanel />
        <FormatToast visible={showFormatToast} />
      </div>
    </EditorContext.Provider>
  );
};

export default ThirdEye;
