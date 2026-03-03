import { useEffect, useRef, useCallback } from "react";
import { loadKaTeX, renderMathToString } from "./mathRenderer";
import { getThemeTokens, updateEditorTheme } from "./Editortheme";

interface EditorProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  crimson: "#dc143c",
  darkred: "#8b0000",
  firebrick: "#b22222",
  indianred: "#cd5c5c",
  lightcoral: "#f08080",
  salmon: "#fa8072",
  darksalmon: "#e9967a",
  lightsalmon: "#ffa07a",
  coral: "#ff7f50",
  tomato: "#ff6347",
  pink: "#ec4899",
  hotpink: "#ff69b4",
  deeppink: "#ff1493",
  lightpink: "#ffb6c1",
  mediumvioletred: "#c71585",
  orange: "#f97316",
  darkorange: "#ff8c00",
  orangered: "#ff4500",
  yellow: "#eab308",
  gold: "#ffd700",
  lightyellow: "#ffffe0",
  lemonchiffon: "#fffacd",
  papayawhip: "#ffefd5",
  moccasin: "#ffe4b5",
  peachpuff: "#ffdab9",
  khaki: "#f0e68c",
  darkkhaki: "#bdb76b",
  green: "#22c55e",
  lime: "#00ff00",
  limegreen: "#32cd32",
  darkgreen: "#006400",
  forestgreen: "#228b22",
  seagreen: "#2e8b57",
  mediumseagreen: "#3cb371",
  springgreen: "#00ff7f",
  mediumspringgreen: "#00fa9a",
  lightgreen: "#90ee90",
  palegreen: "#98fb98",
  darkseagreen: "#8fbc8f",
  olive: "#808000",
  darkolivegreen: "#556b2f",
  olivedrab: "#6b8e23",
  yellowgreen: "#9acd32",
  chartreuse: "#7fff00",
  greenyellow: "#adff2f",
  teal: "#008080",
  darkcyan: "#008b8b",
  blue: "#3b82f6",
  darkblue: "#00008b",
  mediumblue: "#0000cd",
  navy: "#000080",
  royalblue: "#4169e1",
  cornflowerblue: "#6495ed",
  steelblue: "#4682b4",
  deepskyblue: "#00bfff",
  dodgerblue: "#1e90ff",
  lightskyblue: "#87cefa",
  skyblue: "#87ceeb",
  lightblue: "#add8e6",
  powderblue: "#b0e0e6",
  cadetblue: "#5f9ea0",
  aqua: "#00ffff",
  cyan: "#00ffff",
  lightcyan: "#e0ffff",
  paleturquoise: "#afeeee",
  aquamarine: "#7fffd4",
  turquoise: "#40e0d0",
  mediumturquoise: "#48d1cc",
  darkturquoise: "#00ced1",
  purple: "#8b5cf6",
  indigo: "#4b0082",
  violet: "#ee82ee",
  darkviolet: "#9400d3",
  blueviolet: "#8a2be2",
  mediumpurple: "#9370db",
  mediumorchid: "#ba55d3",
  orchid: "#da70d6",
  plum: "#dda0dd",
  thistle: "#d8bfd8",
  lavender: "#e6e6fa",
  magenta: "#ff00ff",
  fuchsia: "#ff00ff",
  darkmagenta: "#8b008b",
  brown: "#a52a2a",
  maroon: "#800000",
  saddlebrown: "#8b4513",
  sienna: "#a0522d",
  chocolate: "#d2691e",
  peru: "#cd853f",
  tan: "#d2b48c",
  burlywood: "#deb887",
  wheat: "#f5deb3",
  gray: "#6b7280",
  grey: "#808080",
  darkgray: "#a9a9a9",
  lightgray: "#d3d3d3",
  silver: "#c0c0c0",
  gainsboro: "#dcdcdc",
  whitesmoke: "#f5f5f5",
  dimgray: "#696969",
  slategray: "#708090",
  lightslategray: "#778899",
  darkslategray: "#2f4f4f",
  black: "#000000",
  white: "#ffffff",
};

const HIGHLIGHT_MAP: Record<string, string> = {
  yellow: "#fef08a",
  green: "#bbf7d0",
  blue: "#bfdbfe",
  red: "#fecaca",
  purple: "#e9d5ff",
  orange: "#fed7aa",
  pink: "#fbcfe8",
};

// ── Tailwind-style color palette for callouts ────────────────────────────────
const CALLOUT_COLOR_PALETTE: Record<
  string,
  { hex: string; bgAlpha: string; icon: string }
> = {
  // Reds
  red: { hex: "#ef4444", bgAlpha: "rgba(239,68,68", icon: "🔴" },
  rose: { hex: "#f43f5e", bgAlpha: "rgba(244,63,94", icon: "🌹" },
  pink: { hex: "#ec4899", bgAlpha: "rgba(236,72,153", icon: "🩷" },
  // Oranges
  orange: { hex: "#f97316", bgAlpha: "rgba(249,115,22", icon: "🟠" },
  amber: { hex: "#f59e0b", bgAlpha: "rgba(245,158,11", icon: "🟡" },
  // Yellows
  yellow: { hex: "#eab308", bgAlpha: "rgba(234,179,8", icon: "💛" },
  lime: { hex: "#84cc16", bgAlpha: "rgba(132,204,22", icon: "💚" },
  // Greens
  green: { hex: "#22c55e", bgAlpha: "rgba(34,197,94", icon: "🟢" },
  emerald: { hex: "#10b981", bgAlpha: "rgba(16,185,129", icon: "💚" },
  teal: { hex: "#14b8a6", bgAlpha: "rgba(20,184,166", icon: "🩵" },
  // Blues
  cyan: { hex: "#06b6d4", bgAlpha: "rgba(6,182,212", icon: "🩵" },
  sky: { hex: "#0ea5e9", bgAlpha: "rgba(14,165,233", icon: "🔵" },
  blue: { hex: "#3b82f6", bgAlpha: "rgba(59,130,246", icon: "🔵" },
  indigo: { hex: "#6366f1", bgAlpha: "rgba(99,102,241", icon: "🟣" },
  // Purples
  violet: { hex: "#8b5cf6", bgAlpha: "rgba(139,92,246", icon: "🟣" },
  purple: { hex: "#a855f7", bgAlpha: "rgba(168,85,247", icon: "🟣" },
  fuchsia: { hex: "#d946ef", bgAlpha: "rgba(217,70,239", icon: "💜" },
  // Neutrals
  gray: { hex: "#6b7280", bgAlpha: "rgba(107,114,128", icon: "⬜" },
  slate: { hex: "#64748b", bgAlpha: "rgba(100,116,139", icon: "🩶" },
  zinc: { hex: "#71717a", bgAlpha: "rgba(113,113,122", icon: "🩶" },
  stone: { hex: "#78716c", bgAlpha: "rgba(120,113,108", icon: "🟤" },
  brown: { hex: "#a16207", bgAlpha: "rgba(161,98,7", icon: "🟤" },
  // Also support old named callouts
  note: { hex: "#3b82f6", bgAlpha: "rgba(59,130,246", icon: "📝" },
  info: { hex: "#06b6d4", bgAlpha: "rgba(6,182,212", icon: "ℹ️" },
  tip: { hex: "#10b981", bgAlpha: "rgba(16,185,129", icon: "💡" },
  success: { hex: "#22c55e", bgAlpha: "rgba(34,197,94", icon: "✅" },
  warning: { hex: "#f59e0b", bgAlpha: "rgba(245,158,11", icon: "⚠️" },
  danger: { hex: "#f97316", bgAlpha: "rgba(249,115,22", icon: "🔥" },
  bug: { hex: "#ec4899", bgAlpha: "rgba(236,72,153", icon: "🐛" },
  example: { hex: "#8b5cf6", bgAlpha: "rgba(139,92,246", icon: "📋" },
  quote: { hex: "#6b7280", bgAlpha: "rgba(107,114,128", icon: "💬" },
};

// Resolve any color name → callout config
function resolveCalloutConfig(type: string): {
  icon: string;
  borderColor: string;
  headerBg: string;
  bodyBg: string;
  titleColor: string;
} {
  const palette = CALLOUT_COLOR_PALETTE[type.toLowerCase()];
  if (palette) {
    return {
      icon: palette.icon,
      borderColor: palette.hex,
      headerBg: `${palette.bgAlpha},0.18)`,
      bodyBg: `${palette.bgAlpha},0.06)`,
      titleColor: palette.hex,
    };
  }
  // Fallback: try CSS named color directly
  return {
    icon: "📌",
    borderColor: type,
    headerBg: "rgba(99,102,241,0.15)",
    bodyBg: "rgba(99,102,241,0.05)",
    titleColor: type,
  };
}

// Keep for backward compat — now just a proxy
const CALLOUT_TYPES = CALLOUT_COLOR_PALETTE;

const BANGLA_LETTERS = [
  "ক",
  "খ",
  "গ",
  "ঘ",
  "ঙ",
  "চ",
  "ছ",
  "জ",
  "ঝ",
  "ঞ",
  "ট",
  "ঠ",
  "ড",
  "ঢ",
  "ণ",
  "ত",
  "থ",
  "দ",
  "ধ",
  "ন",
  "প",
  "ফ",
  "ব",
  "ভ",
  "ম",
  "য",
  "র",
  "ল",
  "শ",
  "ষ",
  "স",
  "হ",
];
function toLowerAlpha(n: number): string {
  let r = "";
  while (n > 0) {
    n--;
    r = String.fromCharCode(97 + (n % 26)) + r;
    n = Math.floor(n / 26);
  }
  return r;
}
const toUpperAlpha = (n: number) => toLowerAlpha(n).toUpperCase();
function toRoman(n: number): string {
  const v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const s = [
    "m",
    "cm",
    "d",
    "cd",
    "c",
    "xc",
    "l",
    "xl",
    "x",
    "ix",
    "v",
    "iv",
    "i",
  ];
  let o = "";
  for (let i = 0; i < v.length; i++)
    while (n >= v[i]) {
      o += s[i];
      n -= v[i];
    }
  return o;
}
const toBangla = (n: number) => BANGLA_LETTERS[n - 1] ?? `(${n})`;
type ListType =
  | "decimal"
  | "lower-alpha"
  | "upper-alpha"
  | "lower-roman"
  | "bangla"
  | "bullet";

const KEYWORDS: Record<string, string[]> = {
  js: [
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "class",
    "import",
    "export",
    "default",
    "from",
    "async",
    "await",
    "new",
    "this",
    "typeof",
    "instanceof",
    "null",
    "undefined",
    "true",
    "false",
    "of",
    "in",
    "switch",
    "case",
    "break",
    "continue",
    "throw",
    "try",
    "catch",
    "finally",
    "extends",
    "super",
    "static",
    "get",
    "set",
    "yield",
    "delete",
    "void",
  ],
  ts: [
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "class",
    "import",
    "export",
    "default",
    "from",
    "async",
    "await",
    "new",
    "this",
    "typeof",
    "instanceof",
    "null",
    "undefined",
    "true",
    "false",
    "of",
    "in",
    "switch",
    "case",
    "break",
    "continue",
    "throw",
    "try",
    "catch",
    "finally",
    "extends",
    "super",
    "static",
    "interface",
    "type",
    "enum",
    "implements",
    "declare",
    "readonly",
    "abstract",
    "namespace",
    "module",
    "any",
    "string",
    "number",
    "boolean",
    "never",
    "void",
    "unknown",
    "keyof",
    "infer",
    "as",
    "is",
  ],
  py: [
    "def",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "class",
    "import",
    "from",
    "as",
    "pass",
    "break",
    "continue",
    "raise",
    "try",
    "except",
    "finally",
    "with",
    "lambda",
    "and",
    "or",
    "not",
    "in",
    "is",
    "None",
    "True",
    "False",
    "global",
    "nonlocal",
    "yield",
    "async",
    "await",
    "del",
    "assert",
  ],
  java: [
    "public",
    "private",
    "protected",
    "class",
    "interface",
    "extends",
    "implements",
    "return",
    "if",
    "else",
    "for",
    "while",
    "new",
    "this",
    "super",
    "static",
    "final",
    "void",
    "null",
    "true",
    "false",
    "import",
    "package",
    "try",
    "catch",
    "finally",
    "throw",
    "throws",
    "abstract",
    "enum",
    "instanceof",
    "switch",
    "case",
    "break",
    "continue",
    "do",
    "synchronized",
  ],
  go: [
    "func",
    "return",
    "if",
    "else",
    "for",
    "range",
    "var",
    "const",
    "type",
    "struct",
    "interface",
    "package",
    "import",
    "defer",
    "go",
    "chan",
    "select",
    "case",
    "default",
    "break",
    "continue",
    "fallthrough",
    "goto",
    "map",
    "nil",
    "true",
    "false",
    "make",
    "new",
    "len",
    "cap",
    "append",
    "copy",
    "delete",
    "close",
    "panic",
    "recover",
  ],
  rust: [
    "fn",
    "let",
    "mut",
    "return",
    "if",
    "else",
    "for",
    "while",
    "loop",
    "match",
    "struct",
    "enum",
    "impl",
    "trait",
    "use",
    "mod",
    "pub",
    "crate",
    "super",
    "self",
    "type",
    "where",
    "async",
    "await",
    "move",
    "ref",
    "in",
    "as",
    "const",
    "static",
    "unsafe",
    "extern",
    "dyn",
    "true",
    "false",
    "None",
    "Some",
    "Ok",
    "Err",
    "Box",
    "Vec",
    "String",
    "Option",
    "Result",
  ],
  bash: [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "for",
    "do",
    "done",
    "while",
    "case",
    "esac",
    "function",
    "return",
    "exit",
    "echo",
    "cd",
    "ls",
    "mkdir",
    "rm",
    "cp",
    "mv",
    "grep",
    "awk",
    "sed",
    "cat",
    "chmod",
    "sudo",
    "export",
    "source",
  ],
  sql: [
    "SELECT",
    "FROM",
    "WHERE",
    "INSERT",
    "INTO",
    "UPDATE",
    "SET",
    "DELETE",
    "CREATE",
    "TABLE",
    "DROP",
    "ALTER",
    "JOIN",
    "LEFT",
    "RIGHT",
    "INNER",
    "OUTER",
    "ON",
    "AND",
    "OR",
    "NOT",
    "NULL",
    "IS",
    "IN",
    "LIKE",
    "BETWEEN",
    "ORDER",
    "BY",
    "GROUP",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "AS",
    "DISTINCT",
    "COUNT",
    "SUM",
    "AVG",
    "MAX",
    "MIN",
    "VALUES",
    "INDEX",
    "PRIMARY",
    "KEY",
    "FOREIGN",
    "REFERENCES",
    "CONSTRAINT",
    "UNIQUE",
    "DEFAULT",
    "AUTO_INCREMENT",
  ],
};

function highlightCode(code: string, lang: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const key = lang
    .toLowerCase()
    .replace("javascript", "js")
    .replace("typescript", "ts")
    .replace("python", "py")
    .replace("golang", "go")
    .replace("shell", "bash")
    .replace("sh", "bash");
  let r = esc(code);
  r = r.replace(
    /(&quot;|&#39;|`)((?:(?!\1).)*)\1/g,
    '<span style="color:var(--ce-str-color)">$1$2$1</span>',
  );
  if (["js", "ts", "java", "go", "rust", "css"].includes(key)) {
    r = r.replace(
      /(\/\/[^\n]*)/g,
      '<span style="color:var(--ce-comment-color);font-style:italic">$1</span>',
    );
    r = r.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span style="color:var(--ce-comment-color);font-style:italic">$1</span>',
    );
  }
  if (["py", "bash"].includes(key))
    r = r.replace(
      /(#[^\n]*)/g,
      '<span style="color:var(--ce-comment-color);font-style:italic">$1</span>',
    );
  r = r.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span style="color:var(--ce-num-color)">$1</span>',
  );
  const kws = KEYWORDS[key];
  if (kws?.length)
    r = r.replace(
      new RegExp(`\\b(${kws.join("|")})\\b`, "g"),
      '<span style="color:var(--ce-kw-color)">$1</span>',
    );
  if (key === "html") {
    r = r.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span style="color:var(--ce-tag-color)">$2</span>',
    );
    r = r.replace(
      /\s([\w-]+)=/g,
      ' <span style="color:var(--ce-str-color)">$1</span>=',
    );
  }
  if (key === "css")
    r = r.replace(
      /([\w-]+)\s*:/g,
      '<span style="color:var(--ce-tag-color)">$1</span>:',
    );
  return r;
}

function renderMathInline(content: string): string {
  return renderMathToString(content, false);
}
function renderMathDisplay(content: string): string {
  return renderMathToString(content, true);
}

let styleInjected = false;
function injectStyles() {
  if (styleInjected) return;
  styleInjected = true;
  const s = document.createElement("style");
  s.textContent = `
    :root{--ce-code-bg:#f8f8f8;--ce-code-border:#e2e2e2;--ce-code-header-bg:#efefef;--ce-code-header-border:#e0e0e0;--ce-code-lang-color:#888;--ce-code-copy-color:#999;--ce-code-copy-border:#d4d4d4;--ce-code-text:#333;--ce-line-num-color:#bbb;--ce-line-num-bg:#f0f0f0;--ce-kw-color:#c0392b;--ce-str-color:#27ae60;--ce-num-color:#e67e22;--ce-comment-color:#aaa;--ce-tag-color:#2980b9;}
    .dark,html.dark,[data-theme="dark"],[data-color-scheme="dark"]{--ce-code-bg:#1a1d2e;--ce-code-border:rgba(255,255,255,0.07);--ce-code-header-bg:#222538;--ce-code-header-border:rgba(255,255,255,0.06);--ce-code-lang-color:#7c7f9e;--ce-code-copy-color:#7c7f9e;--ce-code-copy-border:rgba(255,255,255,0.1);--ce-code-text:#cdd6f4;--ce-line-num-color:#494d6a;--ce-line-num-bg:rgba(0,0,0,0.15);--ce-kw-color:#cba6f7;--ce-str-color:#a6e3a1;--ce-num-color:#fab387;--ce-comment-color:#585b70;--ce-tag-color:#89b4fa;}
    @media(prefers-color-scheme:dark){:root:not([data-theme="light"]):not(.light){--ce-code-bg:#1a1d2e;--ce-code-border:rgba(255,255,255,0.07);--ce-code-header-bg:#222538;--ce-code-header-border:rgba(255,255,255,0.06);--ce-code-lang-color:#7c7f9e;--ce-code-copy-color:#7c7f9e;--ce-code-copy-border:rgba(255,255,255,0.1);--ce-code-text:#cdd6f4;--ce-line-num-color:#494d6a;--ce-line-num-bg:rgba(0,0,0,0.15);--ce-kw-color:#cba6f7;--ce-str-color:#a6e3a1;--ce-num-color:#fab387;--ce-comment-color:#585b70;--ce-tag-color:#89b4fa;}}
    .ce-editor{caret-color:auto;-webkit-user-select:text;user-select:text;}
    .ce-editor p{margin:0;min-height:1.6em;}
    .ce-editor h1{font-size:2em;font-weight:700;margin:0.4em 0;}
    .ce-editor h2{font-size:1.5em;font-weight:700;margin:0.4em 0;}
    .ce-editor h3{font-size:1.25em;font-weight:600;margin:0.3em 0;}
    .ce-editor h4{font-size:1em;font-weight:600;margin:0.3em 0;}
    .ce-editor blockquote{border-left:4px solid #6b7280;margin:6px 0;padding:4px 12px;color:#9ca3af;font-style:italic;background:rgba(107,114,128,0.06);border-radius:0 4px 4px 0;}
    .ce-list{padding-left:0;margin:4px 0;list-style:none;}
    .ce-list li{display:flex;gap:6px;padding:1px 0;line-height:1.6;}
    .ce-list li .ce-marker{min-width:1.8em;text-align:right;flex-shrink:0;user-select:none;-webkit-user-select:none;}
    .ce-list li .ce-content{flex:1;outline:none;min-width:0;word-break:break-word;}
    .ce-list.ce-bullet li .ce-marker{min-width:1em;text-align:center;}
    ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `.ce-indent-${i}{margin-left:${i * 2}em!important}`).join("\n")}
    .ce-code-block{position:relative;margin:8px 0;border-radius:8px;overflow:hidden;background:var(--ce-code-bg);border:1px solid var(--ce-code-border);font-family:'JetBrains Mono','Fira Code','Cascadia Code',monospace;font-size:13px;}
    .ce-code-header{display:flex;align-items:center;justify-content:space-between;padding:7px 14px;background:var(--ce-code-header-bg);border-bottom:1px solid var(--ce-code-header-border);}
    .ce-code-lang{font-size:11px;color:var(--ce-code-lang-color);text-transform:uppercase;letter-spacing:0.1em;font-weight:600;font-family:inherit;}
    .ce-code-copy{font-size:11px;color:var(--ce-code-copy-color);background:transparent;border:1px solid var(--ce-code-copy-border);border-radius:4px;padding:2px 8px;cursor:pointer;transition:all 0.15s;font-family:inherit;pointer-events:all;touch-action:manipulation;-webkit-tap-highlight-color:transparent;min-height:28px;min-width:44px;}
    .ce-code-copy:hover{opacity:0.8;}
    .ce-code-copy.copied{color:#4ade80;border-color:rgba(74,222,128,0.4);}
    .ce-code-block *{box-sizing:border-box;}
    .ce-callout{margin:8px 0;border-radius:6px;overflow:hidden;border-left-width:4px;border-left-style:solid;border-top:none;border-right:none;border-bottom:none;}
    .ce-callout-header{display:flex;align-items:center;gap:8px;padding:9px 14px;font-weight:700;font-size:14px;letter-spacing:0.01em;}
    .ce-callout-icon{font-size:15px;line-height:1;flex-shrink:0;}
    .ce-callout-title{flex:1;outline:none;min-width:0;}
    .ce-callout-fold{font-size:11px;opacity:0.55;transition:transform 0.2s;cursor:pointer;flex-shrink:0;padding:2px 4px;}
    .ce-callout-fold.folded{transform:rotate(-90deg);}
    .ce-callout-body{padding:10px 14px 12px 14px;outline:none;min-height:2em;line-height:1.7;font-size:14px;}
    .ce-callout-body[data-empty="true"]:before{content:attr(data-placeholder);color:rgba(255,255,255,0.25);pointer-events:none;}
    .ce-math-inline{display:inline;cursor:default;}
    .ce-math-display{display:block;text-align:center;padding:12px 16px;margin:6px 0;background:rgba(99,102,241,0.07);border-radius:6px;border-left:3px solid rgba(99,102,241,0.4);cursor:default;overflow-x:auto;-webkit-overflow-scrolling:touch;}
    .ce-preline{white-space:pre-line;font-family:inherit;margin:6px 0;padding:10px 14px;background:rgba(0,0,0,0.04);border-left:3px solid #6b7280;border-radius:0 4px 4px 0;line-height:1.7;outline:none;min-height:1.6em;}
    .dark .ce-preline,[data-theme="dark"] .ce-preline{background:rgba(255,255,255,0.04);}
    .ce-align-left{text-align:left;}
    .ce-align-center{text-align:center;}
    .ce-align-right{text-align:right;}
    .ce-align-justify{text-align:justify;}
    .ce-shortcuts{margin-top:6px;font-size:11.5px;color:#9ca3af;border:1px solid rgba(255,255,255,0.07);border-radius:6px;overflow:hidden;}
    .ce-shortcuts summary{cursor:pointer;user-select:none;padding:5px 10px;background:rgba(255,255,255,0.03);list-style:none;display:flex;align-items:center;gap:6px;}
    .ce-shortcuts summary::marker,.ce-shortcuts summary::-webkit-details-marker{display:none;}
    .ce-shortcuts-body{padding:8px 12px;display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;font-family:monospace;line-height:1.8;}
    .ce-shortcuts-body .sc-head{grid-column:1/-1;color:#6b7280;font-family:sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;margin-top:6px;}
    .ce-shortcuts-body code{background:rgba(255,255,255,0.07);border-radius:3px;padding:0 3px;}
    @media(max-width:600px){.ce-shortcuts-body{grid-template-columns:1fr;}}
    @media(max-width:768px){
      .ce-editor{font-size:16px;-webkit-text-size-adjust:100%;}
      .ce-code-block textarea.ce-code-textarea{font-size:14px !important;}
    }
  `;
  document.head.appendChild(s);
}

function buildCallout(
  type: string,
  titleText?: string,
  bodyHtml?: string,
): HTMLElement {
  const cfg = resolveCalloutConfig(type);
  const wrapper = document.createElement("div");
  wrapper.className = "ce-callout";
  wrapper.dataset.calloutType = type;
  wrapper.style.cssText = `border-left-color:${cfg.borderColor};`;
  const header = document.createElement("div");
  header.className = "ce-callout-header";
  header.style.cssText = `background:${cfg.headerBg};color:${cfg.titleColor};`;
  const icon = document.createElement("span");
  icon.className = "ce-callout-icon";
  icon.contentEditable = "false";
  icon.textContent = cfg.icon;
  const title = document.createElement("span");
  title.className = "ce-callout-title";
  title.contentEditable = "true";
  title.textContent = titleText ?? type.charAt(0).toUpperCase() + type.slice(1);
  const fold = document.createElement("span");
  fold.className = "ce-callout-fold";
  fold.contentEditable = "false";
  fold.textContent = "▾";
  header.append(icon, title, fold);
  const body = document.createElement("div");
  body.className = "ce-callout-body";
  body.contentEditable = "true";
  body.style.cssText = `background:${cfg.bodyBg};color:inherit;`;
  body.dataset.placeholder = "Callout content...";
  body.innerHTML = bodyHtml ?? "\u200B";
  fold.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const folded = body.style.display === "none";
    body.style.display = folded ? "" : "none";
    fold.classList.toggle("folded", !folded);
  });
  wrapper.append(header, body);
  return wrapper;
}

function buildCodeBlock(lang: string, code = ""): HTMLElement {
  const tk = getThemeTokens();
  let codeValue = code;
  const wrapper = document.createElement("div");
  wrapper.className = "ce-code-block";
  wrapper.dataset.codeLang = lang;
  wrapper.contentEditable = "false";
  wrapper.style.cssText = [
    "position:relative",
    "margin:8px 0",
    "border-radius:8px",
    "overflow:hidden",
    `border:1px solid ${tk.codeBorder}`,
    `background:${tk.codeBg}`,
    "font-family:'JetBrains Mono','Fira Code','Cascadia Code',monospace",
    "font-size:13px",
  ].join(";");
  const header = document.createElement("div");
  header.style.cssText = [
    "display:flex",
    "align-items:center",
    "justify-content:space-between",
    "padding:7px 14px",
    `background:${tk.codeHdrBg}`,
    `border-bottom:1px solid ${tk.codeHdrBorder}`,
  ].join(";");
  const langLabel = document.createElement("span");
  langLabel.textContent = (lang || "text").toUpperCase();
  langLabel.style.cssText = `font-size:11px;letter-spacing:0.1em;font-weight:600;color:${tk.codeLang};font-family:inherit;`;
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.style.cssText = [
    "font-size:11px",
    `color:${tk.codeCopy}`,
    "background:transparent",
    `border:1px solid ${tk.codeCopyBorder}`,
    "border-radius:4px",
    "padding:2px 8px",
    "cursor:pointer",
    "font-family:inherit",
    "pointer-events:all",
    "touch-action:manipulation",
    "-webkit-tap-highlight-color:transparent",
    "min-height:28px",
    "min-width:44px",
  ].join(";");
  const doCopy = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const text = codeValue;
    const done = () => {
      copyBtn.textContent = "Copied!";
      copyBtn.style.color = "#4ade80";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.style.color = tk.codeCopy;
      }, 2000);
    };
    if (navigator.clipboard && window.isSecureContext)
      navigator.clipboard
        .writeText(text)
        .then(done)
        .catch(() => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  };
  copyBtn.addEventListener("click", doCopy, { passive: false });
  copyBtn.addEventListener("touchend", doCopy, { passive: false });
  header.append(langLabel, copyBtn);
  const body = document.createElement("div");
  body.style.cssText = "display:flex;";
  const gutter = document.createElement("div");
  gutter.style.cssText = [
    "flex-shrink:0",
    "min-width:3em",
    "padding:12px 0",
    `background:${tk.lineNumBg}`,
    `border-right:1px solid ${tk.lineNumBorder}`,
    "user-select:none",
    "-webkit-user-select:none",
    "pointer-events:none",
    "box-sizing:border-box",
    "text-align:right",
    "font-size:12px",
    "line-height:1.7",
    `color:${tk.lineNumColor}`,
  ].join(";");
  const contentArea = document.createElement("div");
  contentArea.style.cssText = "position:relative;flex:1;min-width:0;";
  const pre = document.createElement("pre");
  pre.style.cssText = [
    "margin:0",
    "padding:12px 16px",
    "font-size:13px",
    "line-height:1.7",
    "tab-size:2",
    "font-family:inherit",
    `color:${tk.codeText}`,
    "pointer-events:none",
    "white-space:pre-wrap",
    "word-break:break-all",
    "min-height:44px",
    "box-sizing:border-box",
  ].join(";");
  const codeEl = document.createElement("code");
  codeEl.className = "ce-code-highlighted";
  codeEl.style.cssText = "display:block;font-family:inherit;";
  pre.appendChild(codeEl);
  const textarea = document.createElement("textarea");
  textarea.className = "ce-code-textarea";
  textarea.spellcheck = false;
  textarea.setAttribute("autocomplete", "off");
  textarea.setAttribute("autocorrect", "off");
  textarea.setAttribute("autocapitalize", "off");
  textarea.style.cssText = [
    "position:absolute",
    "inset:0",
    "z-index:2",
    "width:100%",
    "height:100%",
    "background:transparent",
    "color:transparent",
    "-webkit-text-fill-color:transparent",
    `caret-color:${tk.codeText}`,
    "border:none",
    "outline:none",
    "resize:none",
    "padding:12px 16px",
    "font-family:inherit",
    "font-size:13px",
    "line-height:1.7",
    "tab-size:2",
    "white-space:pre-wrap",
    "word-break:break-all",
    "overflow:hidden",
    "box-sizing:border-box",
    "-webkit-user-select:text",
    "user-select:text",
  ].join(";");
  const sync = () => {
    codeValue = textarea.value;
    const lines = codeValue.split("\n");
    gutter.innerHTML = lines
      .map(
        (_, i) =>
          `<div style="padding:0 10px 0 8px;min-height:1.7em;">${i + 1}</div>`,
      )
      .join("");
    codeEl.innerHTML = lines
      .map(
        (line) =>
          `<div style="min-height:1.7em;">${highlightCode(line, lang) || " "}</div>`,
      )
      .join("");
    requestAnimationFrame(() => {
      textarea.style.height = "0";
      textarea.style.height = pre.scrollHeight + "px";
    });
  };
  if (code) textarea.value = code;
  // Mobile: use both input and compositionend for IME/mobile keyboards
  textarea.addEventListener("input", sync);
  textarea.addEventListener("compositionend", sync);
  textarea.addEventListener("keydown", (ev) => {
    if (ev.key === "Tab") {
      ev.preventDefault();
      const s = textarea.selectionStart,
        e2 = textarea.selectionEnd;
      textarea.value =
        textarea.value.slice(0, s) + "  " + textarea.value.slice(e2);
      textarea.selectionStart = textarea.selectionEnd = s + 2;
      sync();
    }
  });
  contentArea.append(pre, textarea);
  body.append(gutter, contentArea);
  wrapper.append(header, body);
  requestAnimationFrame(sync);
  return wrapper;
}

function fallbackCopy(text: string, done: () => void) {
  const t = document.createElement("textarea");
  t.value = text;
  t.style.cssText = "position:fixed;opacity:0;top:0;left:0;";
  document.body.appendChild(t);
  t.focus();
  t.select();
  try {
    document.execCommand("copy");
    done();
  } catch (err) {
    console.error(err);
  }
  document.body.removeChild(t);
}

function saveCursorOffset(container: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return 0;
  const range = sel.getRangeAt(0);
  const preRange = document.createRange();
  preRange.setStart(container, 0);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
}
function restoreCursorOffset(container: HTMLElement, offset: number) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const len = (node.textContent ?? "").length;
    if (remaining <= len) {
      const sel = window.getSelection()!;
      const r = document.createRange();
      r.setStart(node, remaining);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
      return;
    }
    remaining -= len;
  }
  const sel = window.getSelection()!;
  const r = document.createRange();
  r.selectNodeContents(container);
  r.collapse(false);
  sel.removeAllRanges();
  sel.addRange(r);
}

const ALIGN_MAP: Record<string, string> = {
  "text-left": "ce-align-left",
  "text-center": "ce-align-center",
  "text-right": "ce-align-right",
  "text-justify": "ce-align-justify",
  // Short aliases
  left: "ce-align-left",
  center: "ce-align-center",
  right: "ce-align-right",
  justify: "ce-align-justify",
};

export default function Editor({
  value = "",
  onChange,
  placeholder = "Write something...",
  rows = 8,
  className = "",
  disabled = false,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternal = useRef(false);
  const initialized = useRef(false);
  const isComposing = useRef(false);
  const handleInputRef = useRef<() => void>(() => {});

  useEffect(() => {
    injectStyles();
    updateEditorTheme();
    loadKaTeX();
  }, []);

  useEffect(() => {
    if (!editorRef.current || initialized.current) return;
    initialized.current = true;
    editorRef.current.innerHTML = value || "";
  }, []);

  const emit = useCallback(() => {
    if (!editorRef.current || !onChange) return;
    isInternal.current = true;
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const tryInlineSyntax = useCallback(
    (fullText: string, textNode: Node, offset: number): boolean => {
      const editor = editorRef.current!;
      const typed = fullText.slice(0, offset);
      const commit = (
        matchStart: number,
        matchEnd: number,
        inner: string,
        tag: string,
        style?: Partial<CSSStyleDeclaration>,
      ) => {
        const el = document.createElement(tag);
        if (style) Object.assign(el.style, style);
        el.textContent = inner;
        const before = document.createTextNode(fullText.slice(0, matchStart));
        const after = document.createTextNode(
          fullText.slice(matchEnd) + "\u200B",
        );
        const parent = textNode.parentNode!;
        parent.replaceChild(after, textNode);
        parent.insertBefore(el, after);
        parent.insertBefore(before, el);
        const sel = window.getSelection()!;
        const r = document.createRange();
        r.setStart(after, 1);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        isInternal.current = true;
        onChange?.(editor.innerHTML);
      };
      const commitHTML = (
        matchStart: number,
        matchEnd: number,
        html: string,
      ) => {
        const span = document.createElement("span");
        span.innerHTML = html;
        const before = document.createTextNode(fullText.slice(0, matchStart));
        const after = document.createTextNode(
          fullText.slice(matchEnd) + "\u200B",
        );
        const parent = textNode.parentNode!;
        parent.replaceChild(after, textNode);
        parent.insertBefore(span, after);
        parent.insertBefore(before, span);
        const sel = window.getSelection()!;
        const r = document.createRange();
        r.setStart(after, 1);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        isInternal.current = true;
        onChange?.(editor.innerHTML);
      };
      if (typed.endsWith("~~")) {
        const m = /~~([^~\n]+)~~$/.exec(typed);
        if (m) {
          commit(typed.length - m[0].length, offset, m[1], "span", {
            textDecoration: "line-through",
          });
          return true;
        }
      }
      if (typed.endsWith("**")) {
        const m = /\*\*([^*\n]+)\*\*$/.exec(typed);
        if (m) {
          commit(typed.length - m[0].length, offset, m[1], "span", {
            fontWeight: "700",
          });
          return true;
        }
      }
      if (typed.endsWith("__")) {
        const m = /__([^_\n]+)__$/.exec(typed);
        if (m) {
          commit(typed.length - m[0].length, offset, m[1], "span", {
            textDecoration: "underline",
          });
          return true;
        }
      }
      if (typed.endsWith("_") && !typed.endsWith("__")) {
        const m = /(?<![_])_([^_\n]+)_$/.exec(typed);
        if (m) {
          commit(typed.length - m[0].length, offset, m[1], "span", {
            fontStyle: "italic",
          });
          return true;
        }
      }
      if (typed.endsWith("^")) {
        const m = /\^([^^>\n]+)\^$/.exec(typed);
        if (m) {
          commit(typed.length - m[0].length, offset, m[1], "sup");
          return true;
        }
      }
      if (typed.endsWith("~") && !typed.endsWith("~~")) {
        const m = /(?<!~)~([^~\n]+)~$/.exec(typed);
        if (m) {
          commit(typed.length - m[0].length, offset, m[1], "sub");
          return true;
        }
      }
      if (typed.endsWith("::")) {
        const m = /::([a-zA-Z]+)::([^:\n]+)::$/.exec(typed);
        if (m) {
          const hex = COLOR_MAP[m[1].toLowerCase()];
          if (hex) {
            commit(typed.length - m[0].length, offset, m[2], "span", {
              color: hex,
            });
            return true;
          }
        }
      }
      if (typed.endsWith(";;")) {
        const m = /;;(\d+);;([^;\n]+);;$/.exec(typed);
        if (m) {
          const sz = parseInt(m[1], 10);
          if (sz >= 1 && sz <= 999) {
            commit(typed.length - m[0].length, offset, m[2], "span", {
              fontSize: `${sz}px`,
            });
            return true;
          }
        }
      }
      if (typed.endsWith("==")) {
        const hc = /==([a-z]+)==([^=\n]+)==$/.exec(typed);
        if (hc && HIGHLIGHT_MAP[hc[1]]) {
          commit(typed.length - hc[0].length, offset, hc[2], "span", {
            backgroundColor: HIGHLIGHT_MAP[hc[1]],
            borderRadius: "3px",
            padding: "0 2px",
          });
          return true;
        }
        const hp = /==([^=\n]+)==$/.exec(typed);
        if (hp && !HIGHLIGHT_MAP[hp[1].trim()]) {
          commit(typed.length - hp[0].length, offset, hp[1], "span", {
            backgroundColor: "#fef08a",
            borderRadius: "3px",
            padding: "0 2px",
          });
          return true;
        }
      }
      if (typed.endsWith("$") && !typed.endsWith("$$")) {
        const m = /(?<!\$)\$([^$\n]+)\$$/.exec(typed);
        if (m) {
          const expr = m[1];
          // Render immediately with KaTeX if available, else placeholder
          const win = window as typeof window & {
            katex?: { renderToString: (e: string, o: object) => string };
          };
          let renderedHTML: string;
          if (win.katex) {
            try {
              const katexHTML = win.katex.renderToString(expr, {
                displayMode: false,
                throwOnError: false,
              });
              const span = document.createElement("span");
              span.className = "ce-math-inline";
              span.dataset.math = encodeURIComponent(expr);
              span.dataset.katexDone = "1";
              span.innerHTML = katexHTML;
              // Use direct DOM insertion for instant render
              const before = document.createTextNode(
                fullText.slice(0, typed.length - m[0].length),
              );
              const after = document.createTextNode(
                fullText.slice(offset) + "\u200B",
              );
              const parent = textNode.parentNode!;
              parent.replaceChild(after, textNode);
              parent.insertBefore(span, after);
              parent.insertBefore(before, span);
              const sel = window.getSelection()!;
              const r = document.createRange();
              r.setStart(after, 1);
              r.collapse(true);
              sel.removeAllRanges();
              sel.addRange(r);
              isInternal.current = true;
              onChange?.(editor.innerHTML);
              return true;
            } catch {
              /* fall through to placeholder */
            }
          }
          // eslint-disable-next-line prefer-const
          renderedHTML = renderMathInline(expr);
          commitHTML(typed.length - m[0].length, offset, renderedHTML);
          return true;
        }
      }
      if (typed.endsWith("!!")) {
        const m = /!!([^!\n]+)!!$/.exec(typed);
        if (m) {
          commit(typed.length - m[0].length, offset, m[1], "span", {
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none",
            color: "inherit",
            backgroundColor: "transparent",
            fontSize: "inherit",
          });
          return true;
        }
      }
      return false;
    },
    [onChange],
  );

  const tryBlockFormat = useCallback((): boolean => {
    const editor = editorRef.current!;
    const sel = window.getSelection();
    if (!sel?.rangeCount) return false;
    const range = sel.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE) return false;
    const parentEl = container.parentElement;
    if (
      parentEl?.closest(
        ".ce-code-textarea,.ce-callout-body,.ce-callout-title,.ce-content,.ce-preline",
      )
    )
      return false;
    const block = parentEl?.closest(
      "p,div:not(.ce-editor),h1,h2,h3,h4,blockquote",
    ) as HTMLElement | null;
    if (!block || block === editor || !editor.contains(block)) return false;
    const fullText = block.textContent?.replace(/\u200B/g, "") ?? "";
    const hm = /^(#{1,4}) (.*)$/.exec(fullText);
    if (hm) {
      const level = hm[1].length,
        text = hm[2];
      const rawOff = saveCursorOffset(block);
      const nb = document.createElement(`h${level}`);
      nb.textContent = text || "\u200B";
      block.parentNode!.replaceChild(nb, block);
      restoreCursorOffset(nb, Math.max(0, rawOff - level - 1));
      isInternal.current = true;
      onChange?.(editor.innerHTML);
      return true;
    }
    const bq = /^> (.*)$/.exec(fullText);
    if (bq) {
      const rawOff = saveCursorOffset(block);
      const nb = document.createElement("blockquote");
      nb.textContent = bq[1] || "\u200B";
      block.parentNode!.replaceChild(nb, block);
      restoreCursorOffset(nb, Math.max(0, rawOff - 2));
      isInternal.current = true;
      onChange?.(editor.innerHTML);
      return true;
    }
    const bl = /^[*-] (.*)$/.exec(fullText);
    if (bl) {
      const rawOff = saveCursorOffset(block);
      const list = document.createElement("ul");
      list.className = "ce-list ce-bullet";
      list.dataset.listType = "bullet";
      list.dataset.counter = "2";
      const li = document.createElement("li");
      li.dataset.index = "1";
      const marker = document.createElement("span");
      marker.className = "ce-marker";
      marker.contentEditable = "false";
      marker.textContent = "•";
      const ct = document.createElement("span");
      ct.className = "ce-content";
      ct.contentEditable = "true";
      ct.textContent = bl[1] || "\u200B";
      li.append(marker, ct);
      list.appendChild(li);
      block.parentNode!.replaceChild(list, block);
      restoreCursorOffset(ct, Math.max(0, rawOff - 2));
      isInternal.current = true;
      onChange?.(editor.innerHTML);
      return true;
    }
    const mathBlock = /^\[math\]([\s\S]+)\[\/math\]$/.exec(fullText.trim());
    if (mathBlock) {
      const expr = mathBlock[1];
      const mathEl = document.createElement("div");
      mathEl.className = "ce-math-display";
      mathEl.contentEditable = "false";
      mathEl.dataset.math = encodeURIComponent(expr);
      // Render immediately with KaTeX if available
      const win = window as typeof window & {
        katex?: { renderToString: (e: string, o: object) => string };
      };
      if (win.katex) {
        try {
          mathEl.innerHTML = win.katex.renderToString(expr, {
            displayMode: true,
            throwOnError: false,
          });
          mathEl.dataset.katexDone = "1";
        } catch {
          mathEl.innerHTML = renderMathDisplay(expr);
        }
      } else {
        mathEl.innerHTML = renderMathDisplay(expr);
      }
      block.parentNode!.replaceChild(mathEl, block);
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      mathEl.insertAdjacentElement("afterend", p);
      const selN = window.getSelection()!;
      const r = document.createRange();
      r.setStart(p, 0);
      r.collapse(true);
      selN.removeAllRanges();
      selN.addRange(r);
      isInternal.current = true;
      onChange?.(editor.innerHTML);
      return true;
    }
    const preBlock = /^\[pre\]([\s\S]*)\[\/pre\]$/.exec(fullText.trim());
    if (preBlock) {
      const content = preBlock[1];
      const preEl = document.createElement("div");
      preEl.className = "ce-preline";
      preEl.contentEditable = "true";
      preEl.dataset.blockType = "preline";
      preEl.textContent = content || "\u200B";
      block.parentNode!.replaceChild(preEl, block);
      const sel2 = window.getSelection()!;
      const r2 = document.createRange();
      r2.selectNodeContents(preEl);
      r2.collapse(false);
      sel2.removeAllRanges();
      sel2.addRange(r2);
      isInternal.current = true;
      onChange?.(editor.innerHTML);
      return true;
    }
    const alignBlock =
      /^\[(text-left|text-center|text-right|text-justify|left|center|right|justify)\]([\s\S]*)\[\/\1\]$/.exec(
        fullText.trim(),
      );
    if (alignBlock) {
      const alignKey = alignBlock[1];
      const content = alignBlock[2];
      const alignClass = ALIGN_MAP[alignKey];
      const div = document.createElement("div");
      div.className = `ce-align-block ${alignClass}`;
      div.contentEditable = "true";
      div.dataset.alignType = alignKey;
      div.textContent = content || "\u200B";
      block.parentNode!.replaceChild(div, block);
      const sel2 = window.getSelection()!;
      const r2 = document.createRange();
      r2.selectNodeContents(div);
      r2.collapse(false);
      sel2.removeAllRanges();
      sel2.addRange(r2);
      isInternal.current = true;
      onChange?.(editor.innerHTML);
      return true;
    }
    const dm = /^(\d+)[.)]\s(.*)$/.exec(fullText);
    if (dm) {
      const num = parseInt(dm[1], 10),
        text = dm[2],
        prefixLen = dm[1].length + 2;
      const rawOff = saveCursorOffset(block);
      const list = document.createElement("ol");
      list.className = "ce-list";
      list.dataset.listType = "decimal";
      list.dataset.counter = String(num + 1);
      const li = document.createElement("li");
      li.dataset.index = String(num);
      const marker = document.createElement("span");
      marker.className = "ce-marker";
      marker.contentEditable = "false";
      marker.textContent = `${num}.`;
      const ct = document.createElement("span");
      ct.className = "ce-content";
      ct.contentEditable = "true";
      ct.textContent = text || "\u200B";
      li.append(marker, ct);
      list.appendChild(li);
      block.parentNode!.replaceChild(list, block);
      restoreCursorOffset(ct, Math.max(0, rawOff - prefixLen));
      isInternal.current = true;
      onChange?.(editor.innerHTML);
      return true;
    }
    return false;
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (isComposing.current) return;
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const { startContainer, startOffset } = sel.getRangeAt(0);
      if (startContainer.nodeType === Node.TEXT_NODE) {
        const parentEl = startContainer.parentElement;
        if (
          !parentEl?.closest(
            ".ce-code-textarea,.ce-callout-body,.ce-callout-title,.ce-content,.ce-preline,.ce-align-block",
          )
        ) {
          const fullText = startContainer.textContent ?? "";
          if (tryInlineSyntax(fullText, startContainer, startOffset)) return;
        }
      }
    }
    if (tryBlockFormat()) return;
    emit();
  }, [tryInlineSyntax, tryBlockFormat, emit]);

  // Keep ref updated so native listeners use latest version
  useEffect(() => {
    handleInputRef.current = handleInput;
  }, [handleInput]);

  // Mobile IME composition handlers
  const handleCompositionStart = useCallback(() => {
    isComposing.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposing.current = false;
    handleInput();
  }, [handleInput]);

  const tryMobileSpaceTrigger = useCallback(() => {
    if (isComposing.current) return false;
    const sel = window.getSelection();
    if (!sel?.rangeCount) return false;
    const { startContainer, startOffset } = sel.getRangeAt(0);
    if (startContainer.nodeType !== Node.TEXT_NODE) return false;
    const lineText = (startContainer.textContent ?? "").slice(0, startOffset);
    if (!lineText.trim()) return false;

    const editor = editorRef.current!;

    // Don't trigger inside special blocks
    const parentEl = startContainer.parentElement;
    if (
      parentEl?.closest(
        ".ce-code-textarea,.ce-callout-body,.ce-callout-title,.ce-content,.ce-preline,.ce-align-block",
      )
    )
      return false;

    const getBlock = () =>
      (startContainer as HTMLElement).closest?.(
        "p,div,h1,h2,h3,h4,blockquote",
      ) ?? startContainer.parentElement;

    const buildLi = (type: ListType, n: number): HTMLLIElement => {
      const li = document.createElement("li");
      li.dataset.index = String(n);
      const marker = document.createElement("span");
      marker.className = "ce-marker";
      marker.contentEditable = "false";
      const markerText = (
        {
          decimal: `${n}.`,
          "lower-alpha": `${toLowerAlpha(n)}.`,
          "upper-alpha": `${toUpperAlpha(n)}.`,
          "lower-roman": `${toRoman(n)}.`,
          bangla: `${toBangla(n)}.`,
          bullet: "•",
        } as Record<string, string>
      )[type];
      marker.textContent = markerText;
      const content = document.createElement("span");
      content.className = "ce-content";
      content.contentEditable = "true";
      content.innerHTML = "\u200B";
      li.append(marker, content);
      return li;
    };
    const buildListEl = (type: ListType): HTMLElement => {
      const ol = document.createElement(type === "bullet" ? "ul" : "ol");
      ol.className = `ce-list${type === "bullet" ? " ce-bullet" : ""}`;
      ol.dataset.listType = type;
      ol.dataset.counter = "1";
      return ol;
    };

    const getTopBlock = (node: Node): Node | null => {
      let cur: Node = node;
      while (cur.parentNode && cur.parentNode !== editor) cur = cur.parentNode;
      return cur.parentNode === editor ? cur : null;
    };
    const insertBlockEl = (el: HTMLElement) => {
      const topBlock = getTopBlock(startContainer);
      if (topBlock?.parentNode) topBlock.parentNode.replaceChild(el, topBlock);
      else editor.appendChild(el);
    };

    const doInsertList = (type: ListType) => {
      const listEl = buildListEl(type);
      listEl.dataset.counter = "2";
      const li = buildLi(type, 1);
      listEl.appendChild(li);
      insertBlockEl(listEl);
      const ct = li.querySelector(".ce-content")!;
      const s = window.getSelection()!;
      const r = document.createRange();
      r.selectNodeContents(ct);
      r.collapse(false);
      s.removeAllRanges();
      s.addRange(r);
      emit();
    };

    const doInsertCallout = (type: string) => {
      const cfg = resolveCalloutConfig(type);
      const wrapper = document.createElement("div");
      wrapper.className = "ce-callout";
      wrapper.dataset.calloutType = type;
      wrapper.style.cssText = `border-left-color:${cfg.borderColor};`;
      const header = document.createElement("div");
      header.className = "ce-callout-header";
      header.style.cssText = `background:${cfg.headerBg};color:${cfg.titleColor};`;
      const icon = document.createElement("span");
      icon.className = "ce-callout-icon";
      icon.contentEditable = "false";
      icon.textContent = cfg.icon;
      const title = document.createElement("span");
      title.className = "ce-callout-title";
      title.contentEditable = "true";
      title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      const fold = document.createElement("span");
      fold.className = "ce-callout-fold";
      fold.contentEditable = "false";
      fold.textContent = "▾";
      header.append(icon, title, fold);
      const body = document.createElement("div");
      body.className = "ce-callout-body";
      body.contentEditable = "true";
      body.style.cssText = `background:${cfg.bodyBg};color:inherit;`;
      body.dataset.placeholder = "Callout content...";
      body.innerHTML = "\u200B";
      fold.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const folded = body.style.display === "none";
        body.style.display = folded ? "" : "none";
        fold.classList.toggle("folded", !folded);
      });
      wrapper.append(header, body);
      insertBlockEl(wrapper);
      const s = window.getSelection()!;
      const r = document.createRange();
      r.setStart(body, 0);
      r.collapse(true);
      s.removeAllRanges();
      s.addRange(r);
      emit();
    };

    const doInsertCodeBlock = (lang: string) => {
      const cb = buildCodeBlock(lang);
      insertBlockEl(cb);
      (cb.querySelector(".ce-code-textarea") as HTMLElement)?.focus();
      emit();
    };

    const block = getBlock();
    const blockText = block?.textContent?.replace(/\u200B/g, "").trim() ?? "";
    if (blockText !== lineText) return false; // Not at start of line

    // Callout: [!note] etc
    const cm = /^\[!([a-z]+)\]$/.exec(lineText);
    if (cm && CALLOUT_TYPES[cm[1]]) {
      if (block) block.textContent = "";
      doInsertCallout(cm[1]);
      return true;
    }
    // Also accept any word as color-callout even if not in palette
    if (cm && cm[1]) {
      if (block) block.textContent = "";
      doInsertCallout(cm[1]);
      return true;
    }

    // Code block: ```lang
    const cbm = /^```([a-zA-Z0-9]*)$/.exec(lineText);
    if (cbm) {
      if (block) block.textContent = "";
      doInsertCodeBlock(cbm[1] || "text");
      return true;
    }

    // [pre]
    if (lineText === "[pre]") {
      if (block) block.textContent = "";
      const preEl = document.createElement("div");
      preEl.className = "ce-preline";
      preEl.contentEditable = "true";
      preEl.dataset.blockType = "preline";
      preEl.textContent = "\u200B";
      insertBlockEl(preEl);
      const s = window.getSelection()!;
      const r = document.createRange();
      r.selectNodeContents(preEl);
      r.collapse(false);
      s.removeAllRanges();
      s.addRange(r);
      emit();
      return true;
    }

    // Text alignment — apply to current paragraph, don't create new block
    const at =
      /^\[(text-left|text-center|text-right|text-justify|left|center|right|justify)\]$/.exec(
        lineText,
      );
    if (at) {
      const alignKey = at[1];
      const alignMap: Record<string, string> = {
        left: "left",
        "text-left": "left",
        center: "center",
        "text-center": "center",
        right: "right",
        "text-right": "right",
        justify: "justify",
        "text-justify": "justify",
      };
      const alignValue = alignMap[alignKey] || "left";
      if (block) {
        // Remove the trigger text and apply alignment to current block
        block.textContent = "\u200B";
        (block as HTMLElement).style.textAlign = alignValue;
        (block as HTMLElement).dataset.alignValue = alignValue;
        const s = window.getSelection()!;
        const r = document.createRange();
        r.selectNodeContents(block);
        r.collapse(false);
        s.removeAllRanges();
        s.addRange(r);
      }
      emit();
      return true;
    }

    // Headings and formatting
    const formattingMap: Record<string, [string, string]> = {
      "**": ["bold", ""],
      _: ["italic", ""],
      __: ["underline", ""],
      "~~": ["strikeThrough", ""],
      "####": ["formatBlock", "<h4>"],
      "###": ["formatBlock", "<h3>"],
      "##": ["formatBlock", "<h2>"],
      "#": ["formatBlock", "<h1>"],
      ">": ["formatBlock", "<blockquote>"],
    };
    for (const [trigger, [cmd, val]] of Object.entries(formattingMap)) {
      if (lineText === trigger) {
        if (block) block.textContent = "";
        document.execCommand(cmd, false, val || undefined);
        emit();
        return true;
      }
    }

    // Lists
    const isRoman = /^(i{1,3}|iv|v|vi{0,3}|viii|ix|x)[.)]$/i.test(lineText);
    const isLowerAlpha =
      /^[a-z][.)]$/.test(lineText) && !/^(i|v|x)[.)]$/.test(lineText);
    if (lineText === "*" || lineText === "-") {
      if (block) block.textContent = "";
      doInsertList("bullet");
      return true;
    }
    if (/^\d+[.)]$/.test(lineText)) {
      if (block) block.textContent = "";
      doInsertList("decimal");
      return true;
    }
    if (isLowerAlpha) {
      if (block) block.textContent = "";
      doInsertList("lower-alpha");
      return true;
    }
    if (/^[A-Z][.)]$/.test(lineText)) {
      if (block) block.textContent = "";
      doInsertList("upper-alpha");
      return true;
    }
    if (isRoman) {
      if (block) block.textContent = "";
      doInsertList("lower-roman");
      return true;
    }
    if (/^[\u0995-\u09B9\u09CE\u09DC\u09DD\u09DF][.)]$/.test(lineText)) {
      if (block) block.textContent = "";
      doInsertList("bangla");
      return true;
    }

    return false;
  }, [emit]);

  // Attach native beforeinput listener for mobile space detection
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const onBeforeInput = (e: InputEvent) => {
      if (e.inputType === "insertText" && e.data === " ") {
        if (tryMobileSpaceTrigger()) {
          e.preventDefault();
        }
      }
    };
    el.addEventListener("beforeinput", onBeforeInput as EventListener);
    return () =>
      el.removeEventListener("beforeinput", onBeforeInput as EventListener);
  }, [tryMobileSpaceTrigger]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const sel = window.getSelection();
      if (sel?.rangeCount) {
        const node = sel.getRangeAt(0).startContainer;
        const inCode =
          (node as HTMLElement)?.nodeType === Node.ELEMENT_NODE
            ? (node as HTMLElement).closest?.(".ce-code-content")
            : (node as HTMLElement)?.parentElement?.closest(".ce-code-content");
        if (inCode) return;
      }
      e.preventDefault();
      document.execCommand(
        "insertText",
        false,
        e.clipboardData.getData("text/plain"),
      );
      emit();
    },
    [emit],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const editor = editorRef.current!;
      const exec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        emit();
      };
      const getMarker = (type: ListType, n: number) =>
        ({
          decimal: `${n}.`,
          "lower-alpha": `${toLowerAlpha(n)}.`,
          "upper-alpha": `${toUpperAlpha(n)}.`,
          "lower-roman": `${toRoman(n)}.`,
          bangla: `${toBangla(n)}.`,
          bullet: "•",
        })[type];
      const buildLi = (type: ListType, n: number): HTMLLIElement => {
        const li = document.createElement("li");
        li.dataset.index = String(n);
        const marker = document.createElement("span");
        marker.className = "ce-marker";
        marker.contentEditable = "false";
        marker.textContent = getMarker(type, n);
        const content = document.createElement("span");
        content.className = "ce-content";
        content.contentEditable = "true";
        content.innerHTML = "\u200B";
        li.append(marker, content);
        return li;
      };
      const buildList = (type: ListType): HTMLElement => {
        const ol = document.createElement(type === "bullet" ? "ul" : "ol");
        ol.className = `ce-list${type === "bullet" ? " ce-bullet" : ""}`;
        ol.dataset.listType = type;
        ol.dataset.counter = "1";
        return ol;
      };
      const getTopBlock = (node: Node): Node | null => {
        let cur: Node = node;
        while (cur.parentNode && cur.parentNode !== editor)
          cur = cur.parentNode;
        return cur.parentNode === editor ? cur : null;
      };
      const insertBlock = (el: HTMLElement) => {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const topBlock = getTopBlock(sel.getRangeAt(0).startContainer);
        if (topBlock?.parentNode)
          topBlock.parentNode.replaceChild(el, topBlock);
        else editor.appendChild(el);
      };
      const insertList = (type: ListType) => {
        const list = buildList(type);
        list.dataset.counter = "2";
        const li = buildLi(type, 1);
        list.appendChild(li);
        insertBlock(list);
        const ct = li.querySelector(".ce-content")!;
        const sel = window.getSelection()!;
        const r = document.createRange();
        r.selectNodeContents(ct);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
        emit();
      };
      const insertCallout = (type: string) => {
        const callout = buildCallout(type);
        insertBlock(callout);
        const body = callout.querySelector(".ce-callout-body") as HTMLElement;
        if (body) {
          const sel = window.getSelection()!;
          const r = document.createRange();
          r.setStart(body, 0);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }
        emit();
      };
      const insertCodeBlock = (lang: string) => {
        const cb = buildCodeBlock(lang);
        insertBlock(cb);
        (cb.querySelector(".ce-code-textarea") as HTMLElement)?.focus();
        emit();
      };
      const insertPrelineBlock = () => {
        const preEl = document.createElement("div");
        preEl.className = "ce-preline";
        preEl.contentEditable = "true";
        preEl.dataset.blockType = "preline";
        preEl.textContent = "\u200B";
        insertBlock(preEl);
        const sel = window.getSelection()!;
        const r = document.createRange();
        r.selectNodeContents(preEl);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
        emit();
      };
      const getListContent = (): HTMLElement | null => {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return null;
        let node: Node | null = sel.getRangeAt(0).startContainer;
        while (node && node !== editor) {
          if ((node as HTMLElement).classList?.contains("ce-content"))
            return node as HTMLElement;
          node = node.parentNode;
        }
        return null;
      };
      const handleListEnter = (): boolean => {
        const cs = getListContent();
        if (!cs) return false;
        e.preventDefault();
        const li = cs.parentElement as HTMLLIElement;
        const list = li.parentElement as HTMLElement;
        const type = list.dataset.listType as ListType;
        const text = cs.textContent?.replace(/\u200B/g, "").trim() ?? "";
        const sel = window.getSelection()!;
        if (!text) {
          const p = document.createElement("p");
          p.innerHTML = "&nbsp;";
          list.parentNode!.insertBefore(p, list.nextSibling);
          if (!li.previousElementSibling && !li.nextElementSibling)
            list.remove();
          else li.remove();
          const r = document.createRange();
          r.setStart(p, 0);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
          emit();
          return true;
        }
        const nextIndex = parseInt(list.dataset.counter ?? "2", 10);
        list.dataset.counter = String(nextIndex + 1);
        const newLi = buildLi(type, nextIndex);
        li.after(newLi);
        const newCt = newLi.querySelector(".ce-content")!;
        const r = document.createRange();
        r.selectNodeContents(newCt);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
        emit();
        return true;
      };
      const handleListBackspace = (): boolean => {
        const cs = getListContent();
        if (!cs) return false;
        const sel = window.getSelection()!;
        const range = sel.getRangeAt(0);
        const atStart =
          range.startOffset <= 1 &&
          !(cs.textContent?.replace(/\u200B/g, "") ?? "").length;
        if (!atStart) return false;
        e.preventDefault();
        const li = cs.parentElement as HTMLLIElement;
        const list = li.parentElement as HTMLElement;
        const prevLi = li.previousElementSibling as HTMLElement | null;
        if (prevLi) {
          const pc = prevLi.querySelector(".ce-content") as HTMLElement;
          const r = document.createRange();
          r.selectNodeContents(pc);
          r.collapse(false);
          sel.removeAllRanges();
          sel.addRange(r);
          li.remove();
        } else {
          const prev = list.previousSibling;
          list.remove();
          if (prev) {
            const r = document.createRange();
            r.selectNodeContents(prev);
            r.collapse(false);
            sel.removeAllRanges();
            sel.addRange(r);
          }
        }
        emit();
        return true;
      };
      const handleTab = (): boolean => {
        e.preventDefault();
        const sel = window.getSelection();
        if (!sel?.rangeCount) return true;
        const range = sel.getRangeAt(0);
        const getIndent = (el: Element) => {
          for (let i = 8; i >= 1; i--)
            if (el.classList.contains(`ce-indent-${i}`)) return i;
          return 0;
        };
        const setIndent = (el: Element, level: number) => {
          for (let i = 1; i <= 8; i++) el.classList.remove(`ce-indent-${i}`);
          if (level > 0) el.classList.add(`ce-indent-${Math.min(level, 8)}`);
        };
        const affected: Element[] = [];
        for (const child of Array.from(editor.children)) {
          if (range.collapsed) {
            if (
              child.contains(range.startContainer) ||
              child === range.startContainer
            ) {
              affected.push(child);
              break;
            }
          } else {
            const cr = document.createRange();
            cr.selectNode(child);
            if (
              range.compareBoundaryPoints(Range.END_TO_START, cr) < 0 &&
              range.compareBoundaryPoints(Range.START_TO_END, cr) > 0
            )
              affected.push(child);
          }
        }
        if (!affected.length) {
          document.execCommand("insertText", false, "    ");
          emit();
          return true;
        }
        for (const block of affected) {
          const cur = getIndent(block);
          setIndent(block, e.shiftKey ? Math.max(0, cur - 1) : cur + 1);
        }
        emit();
        return true;
      };
      const getTopLevelAncestor = (node: HTMLElement): HTMLElement => {
        let cur: HTMLElement = node;
        while (cur.parentElement && cur.parentElement !== editor)
          cur = cur.parentElement;
        return cur;
      };
      const insertParagraphAfter = (el: HTMLElement) => {
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        getTopLevelAncestor(el).insertAdjacentElement("afterend", p);
        const sel = window.getSelection()!;
        const r = document.createRange();
        r.setStart(p, 0);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        emit();
      };
      const getCurNode = () =>
        window.getSelection()?.getRangeAt(0)
          ?.startContainer as HTMLElement | null;
      const closest = (
        node: HTMLElement | null,
        s: string,
      ): HTMLElement | null => {
        if (!node) return null;
        if (node.nodeType === Node.ELEMENT_NODE) {
          const direct = (node as HTMLElement).matches?.(s) ? node : null;
          return direct ?? (node.closest?.(s) as HTMLElement | null) ?? null;
        }
        return (node?.parentElement?.closest(s) as HTMLElement | null) ?? null;
      };
      const handleEscape = (): boolean => {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl?.classList.contains("ce-code-textarea")) {
          e.preventDefault();
          const codeBlock = activeEl.closest(".ce-code-block") as HTMLElement;
          if (codeBlock) insertParagraphAfter(codeBlock);
          return true;
        }
        const node = getCurNode();
        const target =
          closest(node, ".ce-callout-body") ??
          closest(node, ".ce-callout-title") ??
          closest(node, ".ce-preline") ??
          closest(node, ".ce-align-block");
        if (target) {
          e.preventDefault();
          const topTarget =
            (target.closest(".ce-callout") as HTMLElement) ?? target;
          insertParagraphAfter(topTarget);
          return true;
        }
        return false;
      };
      const handleCodeBlockEnter = (): boolean => {
        const activeEl = document.activeElement as HTMLElement | null;
        if (!activeEl?.classList.contains("ce-code-textarea")) return false;
        if (e.shiftKey) {
          e.preventDefault();
          const codeBlock = activeEl!.closest(".ce-code-block") as HTMLElement;
          if (codeBlock) insertParagraphAfter(codeBlock);
          return true;
        }
        requestAnimationFrame(() => emit());
        return true;
      };
      const handleCalloutEnter = (): boolean => {
        const node = getCurNode();
        const title = closest(node, ".ce-callout-title");
        const body = closest(node, ".ce-callout-body");
        if (title) {
          e.preventDefault();
          const b = title
            .closest(".ce-callout")
            ?.querySelector(".ce-callout-body") as HTMLElement;
          if (b) {
            b.focus();
            const sel = window.getSelection()!;
            const r = document.createRange();
            r.selectNodeContents(b);
            r.collapse(false);
            sel.removeAllRanges();
            sel.addRange(r);
          }
          return true;
        }
        if (!body) return false;
        if (e.shiftKey) {
          e.preventDefault();
          const callout = body.closest(".ce-callout") as HTMLElement;
          insertParagraphAfter(callout ?? body);
          return true;
        }
        const bodyText =
          (body as HTMLElement).innerText?.replace(/\u200B/g, "").trim() ?? "";
        if (!bodyText) {
          e.preventDefault();
          insertParagraphAfter(body);
          return true;
        }
        requestAnimationFrame(() => emit());
        return true;
      };
      const handlePrelineEnter = (): boolean => {
        const node = getCurNode();
        const pre = closest(node, ".ce-preline");
        if (!pre) return false;
        if (e.shiftKey) {
          e.preventDefault();
          insertParagraphAfter(pre);
          return true;
        }
        return false;
      };
      const handleAlignBlockEnter = (): boolean => {
        const node = getCurNode();
        const ab = closest(node, ".ce-align-block");
        if (!ab) return false;
        if (e.shiftKey) {
          e.preventDefault();
          insertParagraphAfter(ab);
          return true;
        }
        return false;
      };

      if (e.key === "Escape") {
        handleEscape();
        return;
      }
      if (e.key === "Tab") {
        handleTab();
        return;
      }
      if (e.key === "Enter") {
        if (handleCodeBlockEnter()) return;
        if (handleCalloutEnter()) return;
        if (handlePrelineEnter()) return;
        if (handleAlignBlockEnter()) return;
        if (handleListEnter()) return;
        const sel = window.getSelection();
        if (sel?.rangeCount) {
          const container = sel.getRangeAt(0).startContainer;
          const block = (container as HTMLElement).closest?.(
            "blockquote,h1,h2,h3,h4",
          );
          if (block && !container.textContent?.trim()) {
            e.preventDefault();
            exec("formatBlock", "<p>");
          }
        }
        return;
      }
      if (e.key === "Backspace") {
        if (handleListBackspace()) return;
      }
      if (e.key === " ") {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return;
        const { startContainer, startOffset } = sel.getRangeAt(0);
        if (startContainer.nodeType !== Node.TEXT_NODE) return;
        const lineText = (startContainer.textContent ?? "").slice(
          0,
          startOffset,
        );
        const replace = (trigger: string, fn: () => void): boolean => {
          if (lineText !== trigger) return false;
          const block =
            (startContainer as HTMLElement).closest?.(
              "p,div,h1,h2,h3,h4,blockquote",
            ) ?? startContainer.parentElement;
          const blockText =
            block?.textContent?.replace(/\u200B/g, "").trim() ?? "";
          if (blockText !== trigger) return false;
          if (block) block.textContent = "";
          fn();
          return true;
        };
        const cm = /^\[!([a-z]+)\]$/.exec(lineText);
        if (cm && cm[1]) {
          const block =
            (startContainer as HTMLElement).closest?.(
              "p,div,h1,h2,h3,h4,blockquote",
            ) ?? startContainer.parentElement;
          if (block?.textContent?.replace(/\u200B/g, "").trim() === lineText) {
            e.preventDefault();
            if (block) block.textContent = "";
            insertCallout(cm[1]);
            return;
          }
        }
        const cbm = /^```([a-zA-Z0-9]*)$/.exec(lineText);
        if (cbm) {
          const block =
            (startContainer as HTMLElement).closest?.(
              "p,div,h1,h2,h3,h4,blockquote",
            ) ?? startContainer.parentElement;
          if (block?.textContent?.replace(/\u200B/g, "").trim() === lineText) {
            e.preventDefault();
            if (block) block.textContent = "";
            insertCodeBlock(cbm[1] || "text");
            return;
          }
        }
        if (lineText === "[pre]") {
          const block =
            (startContainer as HTMLElement).closest?.(
              "p,div,h1,h2,h3,h4,blockquote",
            ) ?? startContainer.parentElement;
          if (block?.textContent?.replace(/\u200B/g, "").trim() === "[pre]") {
            e.preventDefault();
            if (block) block.textContent = "";
            insertPrelineBlock();
            return;
          }
        }
        const alignTrigger =
          /^\[(text-left|text-center|text-right|text-justify|left|center|right|justify)\]$/.exec(
            lineText,
          );
        if (alignTrigger) {
          const block =
            (startContainer as HTMLElement).closest?.(
              "p,div,h1,h2,h3,h4,blockquote",
            ) ?? (startContainer.parentElement as HTMLElement | null);
          if (block?.textContent?.replace(/\u200B/g, "").trim() === lineText) {
            e.preventDefault();
            const alignMap: Record<string, string> = {
              left: "left",
              "text-left": "left",
              center: "center",
              "text-center": "center",
              right: "right",
              "text-right": "right",
              justify: "justify",
              "text-justify": "justify",
            };
            const alignValue = alignMap[alignTrigger[1]] || "left";
            block.textContent = "\u200B";
            (block as HTMLElement).style.textAlign = alignValue;
            (block as HTMLElement).dataset.alignValue = alignValue;
            const sel2 = window.getSelection()!;
            const r2 = document.createRange();
            r2.selectNodeContents(block);
            r2.collapse(false);
            sel2.removeAllRanges();
            sel2.addRange(r2);
            emit();
            return;
          }
        }
        const isRoman = /^(i{1,3}|iv|v|vi{0,3}|viii|ix|x)[.)]$/i.test(lineText);
        const isLowerAlpha =
          /^[a-z][.)]$/.test(lineText) && !/^(i|v|x)[.)]$/.test(lineText);
        let matched =
          replace("**", () => exec("bold")) ||
          replace("_", () => exec("italic")) ||
          replace("__", () => exec("underline")) ||
          replace("~~", () => exec("strikeThrough")) ||
          replace("####", () => exec("formatBlock", "<h4>")) ||
          replace("###", () => exec("formatBlock", "<h3>")) ||
          replace("##", () => exec("formatBlock", "<h2>")) ||
          replace("#", () => exec("formatBlock", "<h1>")) ||
          replace(">", () => exec("formatBlock", "<blockquote>"));
        if (!matched && (lineText === "*" || lineText === "-"))
          matched = replace(lineText, () => insertList("bullet"));
        if (!matched && /^\d+[.)]$/.test(lineText))
          matched = replace(lineText, () => insertList("decimal"));
        if (!matched && isLowerAlpha)
          matched = replace(lineText, () => insertList("lower-alpha"));
        if (!matched && /^[A-Z][.)]$/.test(lineText))
          matched = replace(lineText, () => insertList("upper-alpha"));
        if (!matched && isRoman)
          matched = replace(lineText, () => insertList("lower-roman"));
        if (
          !matched &&
          /^[\u0995-\u09B9\u09CE\u09DC\u09DD\u09DF][.)]$/.test(lineText)
        )
          matched = replace(lineText, () => insertList("bangla"));
        if (matched) {
          e.preventDefault();
          emit();
        }
      }
    },
    [emit],
  );

  return (
    <div className={`relative ${className}`}>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        data-placeholder={placeholder}
        style={{
          minHeight: `${rows * 1.6}em`,
          outline: "none",
          WebkitUserSelect: "text",
          userSelect: "text",
        }}
        className="ce-editor w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 overflow-auto"
      />
      <details className="ce-shortcuts mt-1 text-xs">
        <summary>⌨️ Shortcuts &amp; Syntax</summary>
        <div className="ce-shortcuts-body">
          <div className="sc-head">Inline Formatting</div>
          <div>
            <code>**text**</code> → <b>Bold</b>
          </div>
          <div>
            <code>_text_</code> → <i>Italic</i>
          </div>
          <div>
            <code>__text__</code> → <u>Underline</u>
          </div>
          <div>
            <code>~~text~~</code> → <s>Strike</s>
          </div>
          <div>
            <code>^text^</code> → super<sup>script</sup>
          </div>
          <div>
            <code>~text~</code> → sub<sub>script</sub>
          </div>
          <div>
            <code>!!text!!</code> → remove format
          </div>

          <div className="sc-head">Color &amp; Highlight</div>
          <div>
            <code>::red::text::</code> →{" "}
            <span style={{ color: "#ef4444" }}>colored text</span>
          </div>
          <div>
            <code>::blue::text::</code> →{" "}
            <span style={{ color: "#3b82f6" }}>colored text</span>
          </div>
          <div>
            <code>==text==</code> →{" "}
            <mark
              style={{
                background: "#fef08a",
                borderRadius: 3,
                padding: "0 2px",
              }}
            >
              highlight
            </mark>
          </div>
          <div>
            <code>==green==text==</code> → colored highlight
          </div>
          <div>
            <code>;;24;;text;;</code> → font size px
          </div>

          <div className="sc-head">Math (LaTeX)</div>
          <div>
            <code>$\frac{"1}{2"}$</code> → inline math
          </div>
          <div>
            <code>[math]...[/math]</code> → display math
          </div>

          <div className="sc-head">Block Triggers (type + Space)</div>
          <div>
            <code>#</code> → H1 &nbsp; <code>##</code> → H2 &nbsp;{" "}
            <code>###</code> → H3
          </div>
          <div>
            <code>&gt;</code> → Blockquote
          </div>
          <div>
            <code>*</code> or <code>-</code> → Bullet list
          </div>
          <div>
            <code>1.</code> → Numbered list
          </div>
          <div>
            <code>a.</code> → Alphabetic list
          </div>
          <div>
            <code>i.</code> → Roman numeral list
          </div>
          <div>
            <code>ক.</code> → Bangla list
          </div>
          <div>
            <code>```js</code> → Code block (js/py/ts/go…)
          </div>

          <div className="sc-head">Color Callout (type + Space)</div>
          <div style={{ gridColumn: "1/-1", lineHeight: 2 }}>
            {[
              ["red", "#ef4444"],
              ["rose", "#f43f5e"],
              ["pink", "#ec4899"],
              ["orange", "#f97316"],
              ["amber", "#f59e0b"],
              ["yellow", "#eab308"],
              ["lime", "#84cc16"],
              ["green", "#22c55e"],
              ["emerald", "#10b981"],
              ["teal", "#14b8a6"],
              ["cyan", "#06b6d4"],
              ["sky", "#0ea5e9"],
              ["blue", "#3b82f6"],
              ["indigo", "#6366f1"],
              ["violet", "#8b5cf6"],
              ["purple", "#a855f7"],
              ["fuchsia", "#d946ef"],
              ["gray", "#6b7280"],
              ["slate", "#64748b"],
              ["brown", "#a16207"],
            ].map(([name, hex]) => (
              <code
                key={name}
                style={{
                  marginRight: 4,
                  marginBottom: 4,
                  display: "inline-block",
                  borderLeft: `3px solid ${hex}`,
                  paddingLeft: 4,
                  background: `${hex}18`,
                  borderRadius: 3,
                }}
              >
                [!{name}]
              </code>
            ))}
          </div>
          <div
            style={{
              gridColumn: "1/-1",
              fontSize: "10px",
              color: "#6b7280",
              marginTop: 2,
            }}
          >
            যেকোনো color নাম কাজ করবে: <code>[!note]</code> <code>[!info]</code>{" "}
            <code>[!warning]</code> <code>[!tip]</code> <code>[!success]</code>{" "}
            <code>[!danger]</code>
          </div>

          <div className="sc-head">Pre-line &amp; Alignment (type + Space)</div>
          <div>
            <code>[pre]</code> → pre-line block
          </div>
          <div>
            <code>[left]</code> → left align
          </div>
          <div>
            <code>[center]</code> → center align
          </div>
          <div>
            <code>[right]</code> → right align
          </div>
          <div>
            <code>[justify]</code> → justify
          </div>

          <div className="sc-head">Block Syntax (Enter to apply)</div>
          <div>
            <code>[pre]text[/pre]</code> → pre-line
          </div>
          <div>
            <code>[center]...[/center]</code> → aligned block
          </div>
          <div>
            <code>[math]...[/math]</code> → display math
          </div>

          <div className="sc-head">Navigation Keys</div>
          <div>
            <kbd>Tab</kbd> → indent &nbsp; <kbd>Shift+Tab</kbd> → outdent
          </div>
          <div>
            <kbd>Esc</kbd> or <kbd>Shift+Enter</kbd> → exit block
          </div>
          <div>
            <kbd>Enter</kbd> (empty list item) → exit list
          </div>
        </div>
      </details>
    </div>
  );
}
