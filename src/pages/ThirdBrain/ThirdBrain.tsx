import {
  useState,
  useEffect,
  useRef,
  useReducer,
  useCallback,
  useMemo,
  useContext,
  createContext,
  memo,
  type Dispatch,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ChevronDown,
  X,
  Terminal,
  AlertCircle,
  CheckCircle,
  WandSparkles,
  FileText,
} from "lucide-react";
import { SiJavascript, SiTypescript, SiPython } from "react-icons/si";
import "./ThirdBrain.css";

// ═══════════════════════════════════════════════════
// LANGUAGE ICON + ACCENT CONFIG
// ═══════════════════════════════════════════════════

// Official brand colors — used for icon tint, tab indicator, active label
const LANG_ACCENT: Record<string, string> = {
  text: "var(--color-text)",
  javascript: "#F7DF1E",
  typescript: "#3178C6",
  python: "#3572A5",
};

// Single icon renderer — active state shows brand color, inactive is dimmed
const LangIcon = ({
  value,
  size = 14,
  active = false,
}: {
  value: string;
  size?: number;
  active?: boolean;
}) => {
  const accent = LANG_ACCENT[value] ?? "var(--color-text)";
  const color = active ? accent : "currentColor";
  const opacity = active ? 1 : 0.4;
  const style = { flexShrink: 0 as const, opacity };

  switch (value) {
    case "javascript":
      return <SiJavascript size={size} color={color} style={style} />;
    case "typescript":
      return <SiTypescript size={size} color={color} style={style} />;
    case "python":
      return <SiPython size={size} color={color} style={style} />;
    default: // "text"
      return (
        <FileText
          size={size}
          style={{
            ...style,
            color: active ? "var(--color-text)" : "var(--color-gray)",
          }}
        />
      );
  }
};

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
interface Language {
  label: string;
  value: string;
  mono: boolean;
}
interface ErrorGutter {
  line: number;
  message: string;
}
type OutputStatus = "loading" | "success" | "error";
interface OutputState {
  status: OutputStatus;
  text: string;
}
type PyStatus = "idle" | "loading" | "ready";
type TextFont = "rubik";

interface AppState {
  text: string;
  lang: Language;
  output: OutputState | null;
  running: boolean;
  pyStatus: PyStatus;
  dropOpen: boolean;
  errors: ErrorGutter[];
  formatting: boolean;
  textFont: TextFont;
}

type AppAction =
  | { type: "SET_TEXT"; payload: string }
  | { type: "SET_LANG"; payload: Language }
  | { type: "SET_OUTPUT"; payload: OutputState | null }
  | { type: "SET_RUNNING"; payload: boolean }
  | { type: "SET_PY_STATUS"; payload: PyStatus }
  | { type: "SET_ERRORS"; payload: ErrorGutter[] }
  | { type: "TOGGLE_DROP" }
  | { type: "CLOSE_DROP" }
  | { type: "SET_FORMATTING"; payload: boolean }
  | { type: "SET_TEXT_FONT"; payload: TextFont };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_TEXT":
      return { ...state, text: action.payload };
    case "SET_LANG":
      return { ...state, lang: action.payload, dropOpen: false, errors: [] };
    case "SET_OUTPUT":
      return { ...state, output: action.payload };
    case "SET_RUNNING":
      return { ...state, running: action.payload };
    case "SET_PY_STATUS":
      return { ...state, pyStatus: action.payload };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "TOGGLE_DROP":
      return { ...state, dropOpen: !state.dropOpen };
    case "CLOSE_DROP":
      return { ...state, dropOpen: false };
    case "SET_FORMATTING":
      return { ...state, formatting: action.payload };
    case "SET_TEXT_FONT":
      return { ...state, textFont: action.payload };
    default:
      return state;
  }
};

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const LANGUAGES: Language[] = [
  { label: "Text", value: "text", mono: false },
  { label: "JavaScript", value: "javascript", mono: true },
  { label: "TypeScript", value: "typescript", mono: true },
  { label: "Python", value: "python", mono: true },
];

const OUTPUT_ICONS: Record<OutputStatus, React.ReactNode> = {
  loading: <Terminal size={13} color="var(--color-gray)" />,
  success: <CheckCircle size={13} color="var(--color-text-hover)" />,
  error: <AlertCircle size={13} color="#ef4444" />,
};

const getOutputLabel = (lang: string): Record<OutputStatus, string> => ({
  loading: `Running ${lang}...`,
  success: `Output · ${lang}`,
  error: `Error · ${lang}`,
});

const PAIR_MAP: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
};
const CLOSERS = new Set(Object.values(PAIR_MAP));

const COMMENT_PREFIX: Record<string, string> = {
  javascript: "// ",
  typescript: "// ",
  python: "# ",
  text: "",
};

// ═══════════════════════════════════════════════════
// BANGLA DETECTION
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// PRETTIER
// ═══════════════════════════════════════════════════
declare global {
  interface Window {
    prettier: {
      format: (code: string, opts: Record<string, unknown>) => Promise<string>;
    };
    prettierPlugins: { babel: unknown; estree: unknown; typescript: unknown };
  }
}

let prettierLoading: Promise<void> | null = null;
let prettierReady = false;

const loadPrettier = (): Promise<void> => {
  if (prettierReady) return Promise.resolve();
  if (prettierLoading) return prettierLoading;
  prettierLoading = new Promise<void>((resolve) => {
    const scripts = [
      "https://unpkg.com/prettier@3.4.2/standalone.js",
      "https://unpkg.com/prettier@3.4.2/plugins/babel.js",
      "https://unpkg.com/prettier@3.4.2/plugins/estree.js",
      "https://unpkg.com/prettier@3.4.2/plugins/typescript.js",
    ];
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === scripts.length) {
        prettierReady = true;
        resolve();
      }
    };
    scripts.forEach((src) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = onLoad;
      s.onerror = onLoad;
      document.head.appendChild(s);
    });
  });
  return prettierLoading;
};

const PRETTIER_PARSERS: Record<string, string> = {
  javascript: "babel",
  typescript: "typescript",
};

const formatCode = async (
  lang: string,
  code: string,
): Promise<string | null> => {
  const parser = PRETTIER_PARSERS[lang];
  if (!parser) return null;
  try {
    await loadPrettier();
    const plugins = [
      window.prettierPlugins?.babel,
      window.prettierPlugins?.estree,
      window.prettierPlugins?.typescript,
    ].filter(Boolean);
    if (!window.prettier || !plugins.length) return null;
    const formatted = await window.prettier.format(code, {
      parser,
      plugins,
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      tabWidth: 2,
      printWidth: 80,
    });
    return formatted !== code ? formatted : null;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════
// PRISM
// ═══════════════════════════════════════════════════
declare global {
  interface Window {
    Prism: {
      highlight: (code: string, grammar: unknown, language: string) => string;
      languages: Record<string, unknown>;
    };
  }
}

let prismLoading: Promise<void> | null = null;
let prismReady = false;

const loadPrism = (): Promise<void> => {
  if (prismReady) return Promise.resolve();
  if (prismLoading) return prismLoading;
  prismLoading = new Promise<void>((resolve) => {
    const core = document.createElement("script");
    core.src =
      "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js";
    core.onload = () => {
      const langs = [
        "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js",
      ];
      let loaded = 0;
      langs.forEach((src) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = s.onerror = () => {
          loaded++;
          if (loaded === langs.length) {
            prismReady = true;
            resolve();
          }
        };
        document.head.appendChild(s);
      });
    };
    core.onerror = () => resolve();
    document.head.appendChild(core);
  });
  return prismLoading;
};

const PRISM_LANG: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
};

// ═══════════════════════════════════════════════════
// RUNNERS
// ═══════════════════════════════════════════════════
type RunResult = { ok: boolean; text: string };

const PYTHON_IN_JS_CHECKS: Array<{ re: RegExp; hint: string }> = [
  { re: /(?<![.\w"'`])print\s*\(/, hint: "use console.log() in JavaScript" },
  { re: /^\s*def\s+\w+\s*\(/, hint: "use 'function name() {}'" },
  { re: /^\s*elif\b/, hint: "use 'else if (...) {}'" },
  { re: /^\s*except(\s+|\s*:)/, hint: "use 'catch (e) {}'" },
  { re: /(?<![.\w"'`])True(?!\w)/, hint: "use lowercase 'true'" },
  { re: /(?<![.\w"'`])False(?!\w)/, hint: "use lowercase 'false'" },
  { re: /(?<![.\w"'`])None(?!\w)/, hint: "use 'null'" },
];

const detectPythonInJS = (code: string): string | null => {
  const lines = code.split("\n");
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (!line.trim() || /^\s*\/\//.test(line) || /^\s*\*/.test(line)) continue;
    const stripped = line.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '""');
    for (const { re, hint } of PYTHON_IN_JS_CHECKS) {
      if (re.test(stripped)) {
        const token = stripped.match(re)?.[0]?.trim() ?? "";
        return `ReferenceError: '${token.replace(/\s*\(.*/, "")}' is not valid JavaScript on line ${li + 1}\n→ ${hint}`;
      }
    }
  }
  return null;
};

const runJS = async (code: string): Promise<RunResult> => {
  const pythonErr = detectPythonInJS(code);
  if (pythonErr) return { ok: false, text: pythonErr };
  const logs: string[] = [];
  const saved = { log: console.log, error: console.error, warn: console.warn };
  console.log = (...a: unknown[]) => logs.push(a.map(String).join(" "));
  console.error = (...a: unknown[]) =>
    logs.push("Error: " + a.map(String).join(" "));
  console.warn = (...a: unknown[]) =>
    logs.push("Warn: " + a.map(String).join(" "));
  const savedPrint = window.print,
    savedAlert = window.alert,
    savedConfirm = window.confirm,
    savedPrompt = window.prompt;
  window.print = () => {
    logs.push("⚠ window.print() is not available here");
  };
  (window as unknown as Record<string, unknown>).alert = (...a: unknown[]) =>
    logs.push("alert: " + a.map(String).join(" "));
  (window as unknown as Record<string, unknown>).confirm = () => false;
  (window as unknown as Record<string, unknown>).prompt = () => null;
  const restore = () => {
    Object.assign(console, saved);
    window.print = savedPrint;
    window.alert = savedAlert;
    window.confirm = savedConfirm;
    window.prompt = savedPrompt;
  };
  try {
    const result: unknown = eval(`(async()=>{ ${code} })()`);
    if (result instanceof Promise) {
      try {
        await result;
        restore();
        return { ok: true, text: logs.join("\n") || "(no output)" };
      } catch (e) {
        restore();
        return { ok: false, text: String(e) };
      }
    }
    restore();
    return Promise.resolve({
      ok: true,
      text: logs.join("\n") || "(no output)",
    });
  } catch (e) {
    restore();
    return Promise.resolve({ ok: false, text: String(e) });
  }
};

const TYPE_PATTERNS: [RegExp, string][] = [
  [
    /:\s*(string|number|boolean|any|void|never|unknown|null|undefined|object)(\[\])?/g,
    "",
  ],
  [/:\s*\w[\w.<> |&]*/g, ""],
  [/^(interface|type)\s+\w[\s\S]*?^}/gm, ""],
  [/<[^>()]*>/g, ""],
  [/^export\s+/gm, ""],
];
const stripTypes = (ts: string): string =>
  TYPE_PATTERNS.reduce((acc, [pat, rep]) => acc.replace(pat, rep), ts);
const runTS = (code: string) => runJS(stripTypes(code));

declare global {
  interface Window {
    loadPyodide: (o: {
      indexURL: string;
    }) => Promise<{ runPython: (c: string) => unknown }>;
  }
}
type PyodideInstance = Awaited<ReturnType<Window["loadPyodide"]>>;
let pyInstance: PyodideInstance | null = null;
let pyLoading: Promise<PyodideInstance> | null = null;
const PY_CDN = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/";

const loadPyodide = (): Promise<PyodideInstance> => {
  if (pyInstance) return Promise.resolve(pyInstance);
  if (pyLoading) return pyLoading;
  pyLoading = new Promise<PyodideInstance>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = PY_CDN + "pyodide.js";
    s.onload = async () => {
      try {
        pyInstance = await window.loadPyodide({ indexURL: PY_CDN });
        resolve(pyInstance);
      } catch (e) {
        reject(e as Error);
      }
    };
    s.onerror = () => reject(new Error("Failed to load Pyodide"));
    document.head.appendChild(s);
  });
  return pyLoading;
};

const runPython = async (code: string): Promise<RunResult> => {
  try {
    const py = await loadPyodide();
    py.runPython(
      "import sys,io\n_o=io.StringIO()\nsys.stdout=_o\nsys.stderr=_o",
    );
    try {
      py.runPython(code);
    } catch (e) {
      py.runPython("sys.stdout=sys.__stdout__;sys.stderr=sys.__stderr__");
      return { ok: false, text: String(e) };
    }
    const out = py.runPython("_o.getvalue()") as string;
    py.runPython("sys.stdout=sys.__stdout__;sys.stderr=sys.__stderr__");
    return { ok: true, text: out.trim() || "(no output)" };
  } catch (e) {
    return { ok: false, text: String(e) };
  }
};

const RUNNERS: Record<string, (c: string) => Promise<RunResult>> = {
  javascript: runJS,
  typescript: runTS,
  python: runPython,
};
const executeCode = (lang: string, code: string): Promise<RunResult> =>
  RUNNERS[lang]?.(code) ??
  Promise.resolve({ ok: false, text: "Unsupported language" });

const parseErrors = (text: string, langValue: string): ErrorGutter[] => {
  if (!text) return [];
  const errors: ErrorGutter[] = [];
  if (langValue === "javascript" || langValue === "typescript") {
    const lineMatch =
      text.match(/line[:\s]+(\d+)/i) ?? text.match(/<anonymous>:(\d+)/);
    if (lineMatch)
      errors.push({
        line: parseInt(lineMatch[1], 10),
        message: text.split("\n")[0],
      });
    else errors.push({ line: 1, message: text.split("\n")[0] });
  }
  if (langValue === "python") {
    const matches = [...text.matchAll(/line (\d+)/gi)];
    matches.forEach((m) => {
      const lineNum = parseInt(m[1], 10);
      if (!errors.find((e) => e.line === lineNum))
        errors.push({
          line: lineNum,
          message: text.split("\n").find((l) => l.trim()) ?? text,
        });
    });
    if (!errors.length) errors.push({ line: 1, message: text.split("\n")[0] });
  }
  return errors;
};

// ═══════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [query]);
  return matches;
};

const useDebounced = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const useOutsideClick = (
  ref: React.RefObject<HTMLElement | null>,
  cb: () => void,
) => {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
};

const useHasSelection = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
): boolean => {
  const [hasSelection, setHasSelection] = useState(false);
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const check = () =>
      setHasSelection(
        ta === document.activeElement && ta.selectionStart !== ta.selectionEnd,
      );
    const blur = () => setHasSelection(false);
    ta.addEventListener("select", check);
    ta.addEventListener("mouseup", check);
    ta.addEventListener("keyup", check);
    ta.addEventListener("blur", blur);
    document.addEventListener("selectionchange", check);
    return () => {
      ta.removeEventListener("select", check);
      ta.removeEventListener("mouseup", check);
      ta.removeEventListener("keyup", check);
      ta.removeEventListener("blur", blur);
      document.removeEventListener("selectionchange", check);
    };
  }, [textareaRef]);
  return hasSelection;
};

// ═══════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════
interface EditorCtx {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  onRun: () => Promise<void>;
  onFormat: () => Promise<void>;
  canRun: boolean;
  hasSelection: boolean;
}
const EditorContext = createContext<EditorCtx | null>(null);
const useEditor = (): EditorCtx => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be inside EditorContext.Provider");
  return ctx;
};

// ═══════════════════════════════════════════════════
// SMART INPUT
// ═══════════════════════════════════════════════════
const useSmartInput = (
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  text: string,
  onChange: (val: string) => void,
  langValue: string,
) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart: ss, selectionEnd: se } = ta;
      const val = ta.value;

      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        const prefix = COMMENT_PREFIX[langValue] ?? "// ";
        if (!prefix) return;
        const lines = val.split("\n");
        let charCount = 0;
        const startLine = lines.findIndex((l) => {
          charCount += l.length + 1;
          return charCount > ss;
        });
        const endLine = (() => {
          let c = 0;
          return lines.findIndex((l) => {
            c += l.length + 1;
            return c > se;
          });
        })();
        const sl = startLine === -1 ? lines.length - 1 : startLine;
        const el = endLine === -1 ? lines.length - 1 : endLine;
        const allCommented = lines
          .slice(sl, el + 1)
          .every((l) => l.trimStart().startsWith(prefix.trimEnd()));
        const newLines = lines.map((line, i) => {
          if (i < sl || i > el) return line;
          if (allCommented) {
            const idx = line.indexOf(prefix.trimEnd());
            return idx !== -1
              ? line.slice(0, idx) + line.slice(idx + prefix.length)
              : line;
          }
          return prefix + line;
        });
        onChange(newLines.join("\n"));
        requestAnimationFrame(() => {
          if (!ta) return;
          ta.setSelectionRange(
            ss,
            se +
              (allCommented ? -prefix.length : prefix.length) * (el - sl + 1),
          );
        });
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const indent = "  ";
        onChange(val.slice(0, ss) + indent + val.slice(se));
        requestAnimationFrame(() =>
          ta.setSelectionRange(ss + indent.length, ss + indent.length),
        );
        return;
      }

      if (e.key === "Enter") {
        const lineStart = val.lastIndexOf("\n", ss - 1) + 1;
        const currentLine = val.slice(lineStart, ss);
        const indent = currentLine.match(/^(\s*)/)?.[1] ?? "";
        const charBefore = val[ss - 1],
          charAfter = val[ss];
        const isBlockOpen =
          charBefore &&
          "{[(".includes(charBefore) &&
          charAfter &&
          "}])".includes(charAfter);
        if (isBlockOpen) {
          e.preventDefault();
          const inner = "\n" + indent + "  ",
            closing = "\n" + indent;
          onChange(val.slice(0, ss) + inner + closing + val.slice(se));
          const pos = ss + inner.length;
          requestAnimationFrame(() => ta.setSelectionRange(pos, pos));
        } else {
          e.preventDefault();
          onChange(val.slice(0, ss) + "\n" + indent + val.slice(se));
          const pos = ss + 1 + indent.length;
          requestAnimationFrame(() => ta.setSelectionRange(pos, pos));
        }
        return;
      }

      if (PAIR_MAP[e.key]) {
        const closer = PAIR_MAP[e.key];
        const selectedText = val.slice(ss, se);
        if (ss !== se) {
          e.preventDefault();
          onChange(
            val.slice(0, ss) + e.key + selectedText + closer + val.slice(se),
          );
          requestAnimationFrame(() => ta.setSelectionRange(ss + 1, se + 1));
          return;
        }
        if (val[ss] === e.key && CLOSERS.has(e.key)) {
          e.preventDefault();
          requestAnimationFrame(() => ta.setSelectionRange(ss + 1, ss + 1));
          return;
        }
        e.preventDefault();
        onChange(val.slice(0, ss) + e.key + closer + val.slice(se));
        requestAnimationFrame(() => ta.setSelectionRange(ss + 1, ss + 1));
        return;
      }

      if (e.key === "Backspace" && ss === se && ss > 0) {
        const charBefore = val[ss - 1],
          charAfter = val[ss];
        if (PAIR_MAP[charBefore] === charAfter) {
          e.preventDefault();
          onChange(val.slice(0, ss - 1) + val.slice(ss + 1));
          requestAnimationFrame(() => ta.setSelectionRange(ss - 1, ss - 1));
        }
      }
    },
    [textareaRef, onChange, langValue],
  );
  return { handleKeyDown };
};

// ═══════════════════════════════════════════════════
// LINTERS
// ═══════════════════════════════════════════════════
interface SyntaxError2 {
  startChar: number;
  endChar: number;
  line: number;
  message: string;
}

const getLineOffset = (lines: string[], lineIdx: number): number =>
  lines.slice(0, lineIdx).reduce((a, l) => a + l.length + 1, 0);

const makeLineError = (
  lines: string[],
  lineIdx: number,
  message: string,
): SyntaxError2 => {
  const offset = getLineOffset(lines, lineIdx);
  const text = lines[lineIdx] ?? "";
  const leading = text.length - text.trimStart().length;
  const start = offset + leading;
  return {
    startChar: start,
    endChar: start + Math.max(text.trim().length, 1),
    line: lineIdx + 1,
    message,
  };
};

const makeTokenError = (
  lines: string[],
  lineIdx: number,
  col: number,
  len: number,
  message: string,
): SyntaxError2 => {
  const start = getLineOffset(lines, lineIdx) + col;
  return {
    startChar: start,
    endChar: start + Math.max(len, 1),
    line: lineIdx + 1,
    message,
  };
};

const lintJS = (code: string): SyntaxError2[] => {
  const errors: SyntaxError2[] = [];
  const codeLines = code.split("\n");
  try {
    new Function(code);
  } catch (e: unknown) {
    if (e instanceof Error) {
      const msg = e.message;
      const lineM =
        msg.match(/line\s+(\d+)/i) ??
        (e as SyntaxError).stack?.match(/<anonymous>:(\d+)/);
      const line = lineM ? parseInt(lineM[1], 10) : 1;
      const text = codeLines[line - 1] ?? "";
      const leading = text.length - text.trimStart().length;
      const start = getLineOffset(codeLines, line - 1) + leading;
      errors.push({
        startChar: start,
        endChar: start + Math.max(text.trim().length, 1),
        line,
        message: msg.split("\n")[0],
      });
      return errors;
    }
  }
  type PR = { re: RegExp; msg: string; tokenRe: RegExp };
  const pythonInJS: PR[] = [
    {
      re: /(?<![.\w"'`])print\s*\(/,
      msg: "ReferenceError: 'print' is not defined — use console.log() in JavaScript",
      tokenRe: /print/,
    },
    {
      re: /^\s*def\s+\w+\s*\(/,
      msg: "Python syntax: use 'function name() {}' instead of 'def name():'",
      tokenRe: /def/,
    },
    {
      re: /^\s*elif\b/,
      msg: "Python syntax: 'elif' is not valid JS — use 'else if (...) {'",
      tokenRe: /elif/,
    },
    {
      re: /^\s*except(\s+|\s*:)/,
      msg: "Python syntax: use 'catch (e) {' instead of 'except'",
      tokenRe: /except/,
    },
    {
      re: /^\s*from\s+\w[\w.]*\s+import\b/,
      msg: "Python import syntax — use: import { x } from 'module'",
      tokenRe: /from/,
    },
    {
      re: /(?<![.\w"'`])True(?!\w)/,
      msg: "ReferenceError: 'True' is not defined — JavaScript uses lowercase 'true'",
      tokenRe: /True/,
    },
    {
      re: /(?<![.\w"'`])False(?!\w)/,
      msg: "ReferenceError: 'False' is not defined — JavaScript uses lowercase 'false'",
      tokenRe: /False/,
    },
    {
      re: /(?<![.\w"'`])None(?!\w)/,
      msg: "ReferenceError: 'None' is not defined — JavaScript uses 'null'",
      tokenRe: /None/,
    },
    {
      re: /^\s*#(?!\s*!)/,
      msg: "Python comment syntax — JavaScript uses '//' for line comments",
      tokenRe: /#/,
    },
  ];
  codeLines.forEach((lineText, li) => {
    if (/^\s*\/\//.test(lineText) || /^\s*\*/.test(lineText)) return;
    const stripped = lineText.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '""');
    pythonInJS.forEach(({ re, msg, tokenRe }) => {
      if (!re.test(stripped)) return;
      const m = tokenRe.exec(lineText);
      if (m)
        errors.push(makeTokenError(codeLines, li, m.index, m[0].length, msg));
    });
  });
  return errors;
};

const lintTS = (code: string): SyntaxError2[] => {
  const errors = lintJS(code);
  const codeLines = code.split("\n");
  codeLines.forEach((lineText, li) => {
    if (/^\s*\/\//.test(lineText)) return;
    const funcRe =
      /(?:function\s+\w*\s*|(?:^|[=,(]\s*))\(([^)]*)\)\s*(?:=>|{)/g;
    let m: RegExpExecArray | null;
    while ((m = funcRe.exec(lineText)) !== null) {
      m[1].split(",").forEach((param) => {
        const p = param.trim();
        if (!p) return;
        const name = p
          .replace(/^\.\.\./, "")
          .split("=")[0]
          .trim();
        if (!name || /[:<{]/.test(name) || !/^[a-zA-Z_$][\w$]*$/.test(name))
          return;
        const col = lineText.indexOf(name, m!.index);
        if (col >= 0)
          errors.push(
            makeTokenError(
              codeLines,
              li,
              col,
              name.length,
              `Parameter '${name}' implicitly has an 'any' type — add a type annotation`,
            ),
          );
      });
    }
    const asAnyRe = /\bas\s+any\b/g;
    while ((m = asAnyRe.exec(lineText)) !== null)
      errors.push(
        makeTokenError(
          codeLines,
          li,
          m.index,
          m[0].length,
          "Unsafe cast to 'any' — consider using a more specific type or 'unknown'",
        ),
      );
    if (
      /^\s*export\s+(?:default\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{/.test(
        lineText,
      ) &&
      !/\)\s*:\s*\w/.test(lineText)
    )
      errors.push(
        makeLineError(
          codeLines,
          li,
          "Missing return type annotation on exported function",
        ),
      );
  });
  return errors;
};

const lintPython = (code: string): SyntaxError2[] => {
  const errors = [] as SyntaxError2[];
  const codeLines = code.split("\n");
  const OPEN_CHARS = ["(", "[", "{"],
    CLOSE_CHARS = [")", "]", "}"];
  const stack: { ch: string; line: number; col: number }[] = [];
  codeLines.forEach((lineText, li) => {
    let inStr: string | null = null;
    for (let ci = 0; ci < lineText.length; ci++) {
      const ch = lineText[ci];
      if (!inStr && (ch === '"' || ch === "'")) {
        inStr = ch;
        continue;
      }
      if (inStr && ch === inStr && lineText[ci - 1] !== "\\") {
        inStr = null;
        continue;
      }
      if (inStr) continue;
      if (ch === "#") break;
      const oi = OPEN_CHARS.indexOf(ch);
      const ci2 = CLOSE_CHARS.indexOf(ch);
      if (oi !== -1) stack.push({ ch, line: li + 1, col: ci });
      if (ci2 !== -1) {
        if (
          !stack.length ||
          OPEN_CHARS.indexOf(stack[stack.length - 1].ch) !== ci2
        ) {
          const start = getLineOffset(codeLines, li) + ci;
          errors.push({
            startChar: start,
            endChar: start + 1,
            line: li + 1,
            message: `SyntaxError: unexpected '${ch}'`,
          });
        } else stack.pop();
      }
    }
  });
  if (stack.length && errors.length === 0) {
    const u = stack[stack.length - 1];
    const start = getLineOffset(codeLines, u.line - 1) + u.col;
    errors.push({
      startChar: start,
      endChar: start + 1,
      line: u.line,
      message: `SyntaxError: '${u.ch}' was never closed`,
    });
  }
  type PR2 = { re: RegExp; msg: string; tokenRe: RegExp };
  const jsInPython: PR2[] = [
    {
      re: /(?<![.\w"'`])console\.log\s*\(/,
      msg: "'console.log' is JavaScript — use print() in Python",
      tokenRe: /console/,
    },
    {
      re: /^\s*function\s+\w+\s*\(/,
      msg: "JavaScript syntax: use 'def name():' in Python",
      tokenRe: /function/,
    },
    {
      re: /^\s*\/\//,
      msg: "JavaScript comment syntax — Python uses '#' for line comments",
      tokenRe: /\/\//,
    },
    {
      re: /(?<![.\w"'`])null(?!\w)/,
      msg: "'null' is JavaScript — Python uses 'None' (capital N)",
      tokenRe: /null/,
    },
    {
      re: /(?<![.\w"'`])undefined(?!\w)/,
      msg: "'undefined' does not exist in Python",
      tokenRe: /undefined/,
    },
    {
      re: /(?<![.\w"'`])true(?!\w)/,
      msg: "'true' is JavaScript — Python uses 'True' (capital T)",
      tokenRe: /true/,
    },
    {
      re: /(?<![.\w"'`])false(?!\w)/,
      msg: "'false' is JavaScript — Python uses 'False' (capital F)",
      tokenRe: /false/,
    },
    {
      re: /\bconst\s+\w+\s*=/,
      msg: "'const' is JavaScript — Python variables need no declaration keyword",
      tokenRe: /const/,
    },
    {
      re: /\blet\s+\w+\s*=/,
      msg: "'let' is JavaScript — Python variables need no declaration keyword",
      tokenRe: /let/,
    },
    {
      re: /\bvar\s+\w+\s*=/,
      msg: "'var' is JavaScript — Python variables need no declaration keyword",
      tokenRe: /var/,
    },
  ];
  codeLines.forEach((lineText, li) => {
    if (/^\s*#/.test(lineText)) return;
    const stripped = lineText.replace(/(["'])(?:(?!\1)[^\\]|\\.)*\1/g, '""');
    jsInPython.forEach(({ re, msg, tokenRe }) => {
      if (!re.test(stripped)) return;
      const m = tokenRe.exec(lineText);
      if (m)
        errors.push(makeTokenError(codeLines, li, m.index, m[0].length, msg));
    });
  });
  let expectedIndent: number | null = null,
    lastLineEndsWithColon = false;
  codeLines.forEach((lineText, li) => {
    const trimmed = lineText.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      lastLineEndsWithColon = false;
      return;
    }
    const indent = lineText.length - lineText.trimStart().length;
    if (lastLineEndsWithColon && indent === 0)
      errors.push(
        makeLineError(
          codeLines,
          li,
          "IndentationError: expected an indented block after ':'",
        ),
      );
    if (expectedIndent === null && indent > 0) expectedIndent = indent;
    if (expectedIndent && indent > 0 && indent % expectedIndent !== 0) {
      const start = getLineOffset(codeLines, li);
      errors.push({
        startChar: start,
        endChar: start + indent,
        line: li + 1,
        message:
          "IndentationError: unindent does not match any outer indent level",
      });
    }
    lastLineEndsWithColon = trimmed.endsWith(":");
  });
  return errors;
};

const LINTERS: Record<string, (c: string) => SyntaxError2[]> = {
  javascript: lintJS,
  typescript: lintTS,
  python: lintPython,
};
const lintCode = (lang: string, code: string): SyntaxError2[] =>
  LINTERS[lang]?.(code) ?? [];

// ═══════════════════════════════════════════════════
// SYNTAX HIGHLIGHT OVERLAY
// ═══════════════════════════════════════════════════
const SyntaxHighlightOverlay = memo(
  ({
    text,
    lang,
    lintErrors,
    font,
    outputOpen,
  }: {
    text: string;
    lang: string;
    lintErrors: SyntaxError2[];
    font: string;
    outputOpen: boolean;
  }) => {
    const [highlighted, setHighlighted] = useState<string>("");
    const [prismLoaded, setPrismLoaded] = useState(prismReady);

    useEffect(() => {
      if (!prismLoaded) loadPrism().then(() => setPrismLoaded(true));
    }, [prismLoaded]);

    useEffect(() => {
      if (!prismLoaded || !window.Prism) {
        setHighlighted(escapeHtml(text));
        return;
      }
      const prismLang = PRISM_LANG[lang];
      if (!prismLang || !window.Prism.languages[prismLang]) {
        setHighlighted(escapeHtml(text));
        return;
      }
      try {
        const html = window.Prism.highlight(
          text,
          window.Prism.languages[prismLang],
          prismLang,
        );
        setHighlighted(applyLintErrorsToHtml(html, text, lintErrors));
      } catch {
        setHighlighted(escapeHtml(text));
      }
    }, [text, lang, prismLoaded, lintErrors]);

    return (
      <div
        className={`tb-overlay tb-syntax-overlay ${font}`}
        aria-hidden="true"
        style={{
          paddingTop: 80,
          paddingBottom: outputOpen ? "calc(40vh + 40px)" : "80px",
        }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  },
);
SyntaxHighlightOverlay.displayName = "SyntaxHighlightOverlay";

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const applyLintErrorsToHtml = (
  html: string,
  plainText: string,
  errors: SyntaxError2[],
): string => {
  if (!errors.length) return html;
  const errorRanges = errors.map((e) => ({
    start: e.startChar,
    end: e.endChar,
    msg: e.message,
  }));
  const tags = new Uint8Array(plainText.length);
  errorRanges.forEach(({ start, end }) => {
    for (let i = start; i < end && i < plainText.length; i++) tags[i] = 1;
  });
  let result = "",
    textPos = 0,
    inTag = false,
    inError = false;
  const errorMsg = errorRanges[0]?.msg ?? "";
  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (ch === "<") {
      inTag = true;
      if (inError) {
        result += "</span>";
        inError = false;
      }
      result += ch;
      continue;
    }
    if (ch === ">") {
      inTag = false;
      result += ch;
      continue;
    }
    if (inTag) {
      result += ch;
      continue;
    }
    if (ch === "&") {
      const semi = html.indexOf(";", i);
      if (semi !== -1 && semi - i <= 6) {
        const entity = html.slice(i, semi + 1);
        const isError = textPos < tags.length && tags[textPos] === 1;
        if (isError && !inError) {
          result += `<span class="tb-error-underline" title="${escapeHtml(errorMsg)}"> `;
          inError = true;
        } else if (!isError && inError) {
          result += "</span>";
          inError = false;
        }
        result += entity;
        textPos++;
        i = semi;
        continue;
      }
    }
    const isError = textPos < tags.length && tags[textPos] === 1;
    if (isError && !inError) {
      result += `<span class="tb-error-underline" title="${escapeHtml(errorMsg)}"> `;
      inError = true;
    } else if (!isError && inError) {
      result += "</span>";
      inError = false;
    }
    result += ch;
    textPos++;
  }
  if (inError) result += "</span>";
  return result;
};

// ═══════════════════════════════════════════════════
// FORMAT TOAST
// ═══════════════════════════════════════════════════
const FormatToast = memo(({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-3.5 py-2 rounded-lg
                   bg-[var(--color-active-bg)] border border-[var(--color-active-border)]
                   text-[11px] font-mono text-[var(--color-text-hover)]"
        style={{ boxShadow: "0 4px 20px var(--color-shadow-md)" }}
      >
        <WandSparkles size={11} />
        <span>Formatted</span>
      </motion.div>
    )}
  </AnimatePresence>
));
FormatToast.displayName = "FormatToast";

// ═══════════════════════════════════════════════════
// RUN / FORMAT BUTTONS
// ═══════════════════════════════════════════════════
const RunButton = memo(() => {
  const { state, onRun, canRun, hasSelection } = useEditor();
  if (hasSelection) return null;
  return (
    <motion.button
      onClick={onRun}
      disabled={!canRun}
      whileHover={canRun ? { scale: 1.05 } : {}}
      whileTap={canRun ? { scale: 0.93 } : {}}
      transition={{ duration: 0.12 }}
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono flex-shrink-0",
        canRun
          ? "bg-[var(--color-text-hover)] text-white cursor-pointer"
          : "bg-[var(--color-active-bg)] text-[var(--color-gray)] border border-[var(--color-active-border)] cursor-default",
      ].join(" ")}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state.running ? (
          <motion.span
            key="spin"
            className="tb-spinner"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.1 }}
          />
        ) : (
          <motion.span
            key="icon"
            style={{ display: "flex" }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.1 }}
          >
            <Play size={10} fill="currentColor" />
          </motion.span>
        )}
      </AnimatePresence>
      <span>{state.running ? "Running..." : "Run"}</span>
    </motion.button>
  );
});
RunButton.displayName = "RunButton";

const FormatButton = memo(() => {
  const { state, onFormat, hasSelection } = useEditor();
  const canFormat =
    (state.lang.value === "javascript" || state.lang.value === "typescript") &&
    !state.running &&
    state.text.trim().length > 0;
  if (hasSelection) return null;
  return (
    <motion.button
      onClick={onFormat}
      disabled={!canFormat}
      title="Format code (Prettier)"
      whileHover={canFormat ? { scale: 1.05 } : {}}
      whileTap={canFormat ? { scale: 0.93 } : {}}
      transition={{ duration: 0.12 }}
      className={[
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono flex-shrink-0",
        canFormat
          ? "bg-[var(--color-active-bg)] border border-[var(--color-active-border)] text-[var(--color-gray)] hover:text-[var(--color-text)] cursor-pointer"
          : "opacity-30 cursor-default",
      ].join(" ")}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state.formatting ? (
          <motion.span
            key="spin"
            className="tb-spinner tb-spinner-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        ) : (
          <motion.span
            key="icon"
            style={{ display: "flex" }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.1 }}
          >
            <WandSparkles size={10} />
          </motion.span>
        )}
      </AnimatePresence>
      <span>{state.formatting ? "Formatting..." : "Format"}</span>
    </motion.button>
  );
});
FormatButton.displayName = "FormatButton";

// ═══════════════════════════════════════════════════
// DESKTOP TABS
// ═══════════════════════════════════════════════════
const DesktopTabs = memo(() => {
  const { state, dispatch } = useEditor();

  const tabs = useMemo(
    () =>
      LANGUAGES.map((l) => ({
        ...l,
        isActive: l.value === state.lang.value,
        showPy: l.value === "python" && state.pyStatus === "loading",
        accent: LANG_ACCENT[l.value] ?? "var(--color-text-hover)",
      })),
    [state.lang.value, state.pyStatus],
  );

  const handleSelect = useCallback(
    (l: Language) => {
      dispatch({ type: "SET_LANG", payload: l });
      localStorage.setItem("thirdbrain-lang", l.value);
    },
    [dispatch],
  );

  return (
    <nav
      className="flex flex-col gap-0.5 pt-20 px-2 flex-shrink-0"
      style={{
        width: 136,
        borderRight: "1px solid var(--color-active-border)",
      }}
    >
      {tabs.map((l) => (
        <motion.button
          key={l.value}
          onClick={() => handleSelect(l)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ x: 2 }}
          transition={{ duration: 0.12 }}
          className={[
            "relative flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono font-medium text-left w-full transition-colors",
            l.isActive
              ? "bg-[var(--color-active-bg)]"
              : "text-[var(--color-gray)] hover:text-[var(--color-text)] hover:bg-[var(--color-active-bg)]",
          ].join(" ")}
        >
          {/* Indicator bar — accent color of the active language */}
          {l.isActive && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
              style={{ backgroundColor: l.accent }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            />
          )}

          {/* Brand icon */}
          <span className="pl-1.5 flex items-center flex-shrink-0">
            <LangIcon value={l.value} size={14} active={l.isActive} />
          </span>

          {/* Label — accent color when active */}
          <span style={l.isActive ? { color: l.accent } : {}}>{l.label}</span>

          {l.showPy && <span className="tb-py-dot ml-auto" />}
        </motion.button>
      ))}
    </nav>
  );
});
DesktopTabs.displayName = "DesktopTabs";

// ═══════════════════════════════════════════════════
// MOBILE DROPDOWN
// ═══════════════════════════════════════════════════
const MobileDropdown = memo(() => {
  const { state, dispatch } = useEditor();
  const dropRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => dispatch({ type: "CLOSE_DROP" }), [dispatch]);
  const handleSelect = useCallback(
    (l: Language) => {
      dispatch({ type: "SET_LANG", payload: l });
      localStorage.setItem("thirdbrain-lang", l.value);
    },
    [dispatch],
  );
  useOutsideClick(dropRef, close);

  const activeAccent = LANG_ACCENT[state.lang.value] ?? "var(--color-text)";

  return (
    <div ref={dropRef} className="relative">
      <motion.button
        onClick={() => dispatch({ type: "TOGGLE_DROP" })}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium
                   bg-[var(--color-active-bg)] border border-[var(--color-active-border)] text-[var(--color-text)]"
      >
        <LangIcon value={state.lang.value} size={13} active={true} />
        <span style={{ color: activeAccent }}>{state.lang.label}</span>
        {state.lang.value === "python" && state.pyStatus === "loading" && (
          <span className="tb-py-dot" />
        )}
        <motion.span
          animate={{ rotate: state.dropOpen ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: "flex" }}
        >
          <ChevronDown size={12} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {state.dropOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 mt-1.5 z-50 min-w-[160px] rounded-lg overflow-hidden
                       border border-[var(--color-active-border)] bg-[var(--color-bg)]"
            style={{ boxShadow: "0 8px 28px var(--color-shadow-md)" }}
          >
            {LANGUAGES.map((l, i) => {
              const isActive = l.value === state.lang.value;
              const accent = LANG_ACCENT[l.value] ?? "var(--color-text)";
              return (
                <motion.button
                  key={l.value}
                  onClick={() => handleSelect(l)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.97 }}
                  className={[
                    "w-full text-left px-3.5 py-2.5 text-xs font-mono transition-colors flex items-center gap-2.5",
                    isActive
                      ? "bg-[var(--color-active-bg)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-active-bg)]",
                  ].join(" ")}
                >
                  <LangIcon value={l.value} size={13} active={isActive} />
                  <span style={isActive ? { color: accent } : {}}>
                    {l.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
MobileDropdown.displayName = "MobileDropdown";

// ═══════════════════════════════════════════════════
// ERROR GUTTER
// ═══════════════════════════════════════════════════
const ErrorGutterLine = memo(({ error }: { error: ErrorGutter }) => (
  <motion.div
    initial={{ opacity: 0, x: -4 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -4 }}
    transition={{ duration: 0.18 }}
    className="flex items-start gap-2 px-3 py-1.5 text-[11px] font-mono bg-red-500/10 border-l-2 border-red-500 text-red-400"
  >
    <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
    <span>
      <span className="font-semibold">Line {error.line}:</span>{" "}
      <span className="opacity-80">{error.message}</span>
    </span>
  </motion.div>
));
ErrorGutterLine.displayName = "ErrorGutterLine";

// ═══════════════════════════════════════════════════
// EDITOR
// ═══════════════════════════════════════════════════
const Editor = memo(
  ({
    textareaRef,
    outputOpen,
  }: {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    outputOpen: boolean;
  }) => {
    const { state, dispatch } = useEditor();
    const [liveErrors, setLiveErrors] = useState<SyntaxError2[]>([]);
    const lintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fontDetectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onChange = useCallback(
      (val: string) => dispatch({ type: "SET_TEXT", payload: val }),
      [dispatch],
    );
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
      [onChange],
    );

    useEffect(() => {
      if (lintTimer.current) clearTimeout(lintTimer.current);
      if (!state.lang.mono || !state.text.trim()) {
        setLiveErrors([]);
        return;
      }
      lintTimer.current = setTimeout(
        () => setLiveErrors(lintCode(state.lang.value, state.text)),
        300,
      );
      return () => {
        if (lintTimer.current) clearTimeout(lintTimer.current);
      };
    }, [state.text, state.lang.value, state.lang.mono]);

    useEffect(() => {
      if (state.lang.value !== "text") return;
      if (fontDetectTimer.current) clearTimeout(fontDetectTimer.current);
      fontDetectTimer.current = setTimeout(() => {
        const newFont: TextFont = "rubik";
        if (newFont !== state.textFont)
          dispatch({ type: "SET_TEXT_FONT", payload: newFont });
      }, 200);
      return () => {
        if (fontDetectTimer.current) clearTimeout(fontDetectTimer.current);
      };
    }, [state.text, state.lang.value, state.textFont, dispatch]);

    const { handleKeyDown } = useSmartInput(
      textareaRef,
      state.text,
      onChange,
      state.lang.value,
    );
    const placeholder = useMemo(
      () =>
        state.lang.value === "text"
          ? "start writing..."
          : `// ${state.lang.label}`,
      [state.lang],
    );
    const gutterErrors = useMemo(
      () =>
        state.errors.length
          ? state.errors
          : liveErrors.map((e) => ({ line: e.line, message: e.message })),
      [state.errors, liveErrors],
    );
    const fontClass = useMemo(
      () => (state.lang.mono ? "code" : state.textFont),
      [state.lang.mono, state.textFont],
    );
    const editorStyle = {
      paddingTop: 80,
      paddingBottom: outputOpen ? "calc(40vh + 40px)" : "80px",
      minHeight: "calc(100vh - 80px)",
    };

    return (
      <div className="flex flex-col flex-1">
        <AnimatePresence>
          {gutterErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col overflow-hidden border-b border-[var(--color-active-border)]"
            >
              {gutterErrors.map((err, i) => (
                <ErrorGutterLine key={`${err.line}-${i}`} error={err} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="relative flex-1">
          {state.lang.mono && (
            <SyntaxHighlightOverlay
              text={state.text}
              lang={state.lang.value}
              lintErrors={liveErrors}
              font={fontClass}
              outputOpen={outputOpen}
            />
          )}
          <textarea
            ref={textareaRef}
            value={state.text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder={placeholder}
            className={`tb-editor tb-textarea w-full${state.lang.mono ? " code" : ` prose ${fontClass}`}`}
            style={editorStyle}
          />
        </div>
      </div>
    );
  },
);
Editor.displayName = "Editor";

// ═══════════════════════════════════════════════════
// OUTPUT PANEL
// ═══════════════════════════════════════════════════
const OutputPanel = memo(() => {
  const { state, dispatch } = useEditor();
  const { output, lang } = state;
  const dismiss = useCallback(
    () => dispatch({ type: "SET_OUTPUT", payload: null }),
    [dispatch],
  );
  const label = useMemo(
    () => (output ? getOutputLabel(lang.label)[output.status] : ""),
    [output, lang.label],
  );
  return (
    <AnimatePresence>
      {output && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t border-[var(--color-active-border)] bg-[var(--color-bg)]"
          style={{
            maxHeight: "40vh",
            boxShadow: "0 -4px 32px var(--color-shadow-md)",
          }}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0 border-b border-[var(--color-active-border)] bg-[var(--color-active-bg)]">
            <span className="flex flex-shrink-0">
              {OUTPUT_ICONS[output.status]}
            </span>
            <span className="flex-1 text-[10px] font-mono uppercase tracking-widest text-[var(--color-gray)]">
              {label}
            </span>
            <motion.button
              onClick={dismiss}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              className="flex items-center justify-center p-1 rounded text-[var(--color-gray)] hover:text-[var(--color-text)] hover:bg-[var(--color-active-bg)] transition-colors"
            >
              <X size={13} />
            </motion.button>
          </div>
          <div className="overflow-y-auto p-4 flex-1">
            <AnimatePresence mode="wait">
              {output.status === "loading" ? (
                <motion.pre
                  key="loading"
                  className="tb-pre loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Executing
                  <span className="tb-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </motion.pre>
              ) : (
                <motion.pre
                  key="result"
                  className={`tb-pre ${output.status}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {output.text}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
OutputPanel.displayName = "OutputPanel";

// ═══════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════
const INITIAL_STATE: AppState = {
  text: "",
  lang: LANGUAGES[0],
  output: null,
  running: false,
  pyStatus: "idle",
  dropOpen: false,
  errors: [],
  formatting: false,
  textFont: "rubik",
};

const ThirdBrain = () => {
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

  useEffect(() => {
    if (debouncedText)
      localStorage.setItem("thirdbrain-content", debouncedText);
  }, [debouncedText]);

  // Pyodide preload
  useEffect(() => {
    if (state.lang.value === "python" && state.pyStatus === "idle") {
      dispatch({ type: "SET_PY_STATUS", payload: "loading" });
      loadPyodide()
        .then(() => dispatch({ type: "SET_PY_STATUS", payload: "ready" }))
        .catch(() => dispatch({ type: "SET_PY_STATUS", payload: "idle" }));
    }
  }, [state.lang.value, state.pyStatus]);

  // Auto-format on pause
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

        {!isDesktop && (
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between gap-2 px-4 pt-20 pb-3">
              <MobileDropdown />
              <div className="flex items-center gap-2">
                <FormatButton />
                <RunButton />
              </div>
            </div>
            <div>
              <Editor textareaRef={textareaRef} outputOpen={!!state.output} />
            </div>
          </div>
        )}

        <OutputPanel />
        <FormatToast visible={showFormatToast} />
      </div>
    </EditorContext.Provider>
  );
};

export default ThirdBrain;
