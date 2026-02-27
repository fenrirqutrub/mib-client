let injected = false;

export function injectArticleStyles() {
  if (injected) return;
  injected = true;
  const s = document.createElement("style");
  s.textContent = `
    :root {
      --ce-code-bg: #f8f8f8; --ce-code-border: #e2e2e2;
      --ce-code-header-bg: #efefef; --ce-code-header-border: #e0e0e0;
      --ce-code-lang-color: #888; --ce-code-copy-color: #999;
      --ce-code-copy-border: #d4d4d4; --ce-code-text: #333;
      --ce-line-num-color: #bbb; --ce-line-num-bg: #f0f0f0;
      --ce-kw-color: #c0392b; --ce-str-color: #27ae60;
      --ce-num-color: #e67e22; --ce-comment-color: #aaa; --ce-tag-color: #2980b9;
    }
    .dark, html.dark, [data-theme="dark"], [data-color-scheme="dark"] {
      --ce-code-bg: #1a1d2e; --ce-code-border: rgba(255,255,255,0.07);
      --ce-code-header-bg: #222538; --ce-code-header-border: rgba(255,255,255,0.06);
      --ce-code-lang-color: #7c7f9e; --ce-code-copy-color: #7c7f9e;
      --ce-code-copy-border: rgba(255,255,255,0.1); --ce-code-text: #cdd6f4;
      --ce-line-num-color: #494d6a; --ce-line-num-bg: rgba(0,0,0,0.15);
      --ce-kw-color: #cba6f7; --ce-str-color: #a6e3a1;
      --ce-num-color: #fab387; --ce-comment-color: #585b70; --ce-tag-color: #89b4fa;
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]):not(.light) {
        --ce-code-bg: #1a1d2e; --ce-code-border: rgba(255,255,255,0.07);
        --ce-code-header-bg: #222538; --ce-code-header-border: rgba(255,255,255,0.06);
        --ce-code-lang-color: #7c7f9e; --ce-code-copy-color: #7c7f9e;
        --ce-code-copy-border: rgba(255,255,255,0.1); --ce-code-text: #cdd6f4;
        --ce-line-num-color: #494d6a; --ce-line-num-bg: rgba(0,0,0,0.15);
        --ce-kw-color: #cba6f7; --ce-str-color: #a6e3a1;
        --ce-num-color: #fab387; --ce-comment-color: #585b70; --ce-tag-color: #89b4fa;
      }
    }
    .ce-editor p, .article-body p { margin: 0; min-height: 1.6em; }
    .article-body h1,.ce-editor h1{font-size:2em;font-weight:700;margin:.4em 0}
    .article-body h2,.ce-editor h2{font-size:1.5em;font-weight:700;margin:.4em 0}
    .article-body h3,.ce-editor h3{font-size:1.25em;font-weight:600;margin:.3em 0}
    .article-body h4,.ce-editor h4{font-size:1em;font-weight:600;margin:.3em 0}
    .article-body blockquote,.ce-editor blockquote{border-left:4px solid #6b7280;margin:6px 0;padding:4px 12px;color:#9ca3af;font-style:italic;background:rgba(107,114,128,0.06);border-radius:0 4px 4px 0}
    .ce-list{padding-left:0;margin:4px 0;list-style:none}
    .ce-list li{display:flex;gap:6px;padding:1px 0;line-height:1.6}
    .ce-list li .ce-marker{min-width:1.8em;text-align:right;flex-shrink:0;user-select:none}
    .ce-list li .ce-content{flex:1;outline:none;min-width:0;word-break:break-word}
    .ce-list.ce-bullet li .ce-marker{min-width:1em;text-align:center}
    .ce-indent-1{margin-left:2em!important}.ce-indent-2{margin-left:4em!important}
    .ce-indent-3{margin-left:6em!important}.ce-indent-4{margin-left:8em!important}
    .ce-indent-5{margin-left:10em!important}.ce-indent-6{margin-left:12em!important}
    .ce-indent-7{margin-left:14em!important}.ce-indent-8{margin-left:16em!important}

    /* ── Code block ── */
    .ce-code-block{
      position:relative;margin:8px 0;border-radius:8px;overflow:hidden;
      background:var(--ce-code-bg);border:1px solid var(--ce-code-border);
      font-family:'JetBrains Mono','Fira Code','Cascadia Code',monospace;
      max-width:100%;
    }
    .ce-code-header{display:flex;align-items:center;justify-content:space-between;padding:7px 14px;background:var(--ce-code-header-bg);border-bottom:1px solid var(--ce-code-header-border)}
    .ce-code-lang{font-size:11px;color:var(--ce-code-lang-color);text-transform:uppercase;letter-spacing:.1em;font-weight:600;font-family:inherit}

    /* ── Copy button – mobile friendly ── */
    .ce-code-copy{
      font-size:11px;color:var(--ce-code-copy-color);background:transparent;
      border:1px solid var(--ce-code-copy-border);border-radius:4px;
      padding:4px 10px;cursor:pointer;transition:all .15s;font-family:inherit;
      pointer-events:all !important;
      touch-action:manipulation;
      -webkit-tap-highlight-color:transparent;
      user-select:none;
      -webkit-user-select:none;
      position:relative;
      z-index:10;
      min-height:28px;
      min-width:44px;
    }
    .ce-code-copy:hover{opacity:.8}
    .ce-code-copy:active{opacity:.6;transform:scale(0.97)}
    .ce-code-copy.copied{color:#4ade80!important;border-color:rgba(74,222,128,.4)!important}

    .ce-code-body{display:flex;overflow-x:auto;-webkit-overflow-scrolling:touch}
    .ce-code-gutter{
      flex-shrink:0;min-width:3.2em;padding:10px 0;
      background:var(--ce-line-num-bg);border-right:1px solid var(--ce-code-border);
      user-select:none;-webkit-user-select:none;pointer-events:none;
      position:sticky;left:0;z-index:1;
    }
    .ce-code-gutter-line{display:block;padding:0 10px 0 14px;text-align:right;color:var(--ce-line-num-color);font-size:12px;line-height:1.7;min-height:1.7em}
    .ce-code-content{flex:1;min-width:0;overflow-x:auto;-webkit-overflow-scrolling:touch}
    .ce-code-pre{
      margin:0;padding:10px 16px;font-size:13px;line-height:1.7;tab-size:2;
      font-family:inherit;color:var(--ce-code-text);background:transparent;
      white-space:pre;overflow-x:auto;
    }
    .ce-code-line{display:inline;min-height:1.7em}

    @media (max-width: 640px) {
      .ce-code-pre{font-size:12px;padding:8px 12px}
      .ce-code-gutter-line{font-size:11px}
      .ce-code-header{padding:6px 10px}
    }

    .article-body textarea{display:none!important}
    .article-body .ce-callout *{pointer-events:none!important;outline:none!important}
    .article-body .ce-code-copy{pointer-events:all!important;cursor:pointer!important;touch-action:manipulation!important}
    .article-body .ce-callout-fold{display:none!important}

    /* ── Callout ── */
    .ce-callout{margin:8px 0;border-radius:6px;overflow:hidden;border-left-width:4px;border-left-style:solid;border-top:none;border-right:none;border-bottom:none}
    .ce-callout-header{display:flex;align-items:center;gap:8px;padding:9px 14px;font-weight:700;font-size:14px;letter-spacing:.01em}
    .ce-callout-icon{font-size:15px;line-height:1;flex-shrink:0}
    .ce-callout-title{flex:1}
    .ce-callout-body{padding:10px 14px 12px 14px;min-height:2em;line-height:1.7;font-size:14px}

    /* ── Math ── */
    .ce-math-inline{
      display:inline;
      font-family:'STIX Two Math','Latin Modern Math',serif;
      font-size:1.05em;
      background:rgba(99,102,241,.12);
      border-radius:3px;padding:0 3px;
    }
    .ce-math-display{
      display:block;text-align:center;
      font-family:'STIX Two Math','Latin Modern Math',serif;
      font-size:1.1em;
      padding:12px 8px;margin:6px 0;
      background:rgba(99,102,241,.07);
      border-radius:6px;
      border-left:3px solid rgba(99,102,241,.4);
      overflow-x:auto;
      -webkit-overflow-scrolling:touch;
    }
    .katex-display{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;padding:4px 0}
    .katex{font-size:1em!important}
    @media (max-width:640px){
      .ce-math-display{font-size:0.95em;padding:10px 4px}
      .katex{font-size:0.9em!important}
    }

    /* ── Pre-line block ── */
    .ce-preline{white-space:pre-line!important;font-family:inherit;margin:6px 0;padding:10px 14px;background:rgba(0,0,0,0.04);border-left:3px solid #6b7280;border-radius:0 4px 4px 0;line-height:1.7}
    .dark .ce-preline,[data-theme="dark"] .ce-preline{background:rgba(255,255,255,0.04)}
    .article-body .ce-preline{outline:none;pointer-events:none;user-select:text;white-space:pre-line!important}

    /* ── Text alignment ── */
    .ce-align-left,.article-body .ce-align-left{text-align:left}
    .ce-align-center,.article-body .ce-align-center{text-align:center}
    .ce-align-right,.article-body .ce-align-right{text-align:right}
    .ce-align-justify,.article-body .ce-align-justify{text-align:justify}
    .ce-align-block{margin:2px 0;min-height:1.4em}
    .article-body .ce-align-block{outline:none;pointer-events:none;user-select:text}

    .article-card-math .katex,.article-card-math .ce-math-inline,.article-card-math .ce-math-display{
      font-size:0.85em;background:transparent;border:none;padding:0;display:inline;
    }
  `;
  document.head.appendChild(s);
}

// ─── Keywords ─────────────────────────────────────────────────────────────────
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

function performCopy(text: string, btn: HTMLButtonElement): void {
  const onSuccess = () => {
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 2000);
  };
  const onFail = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText =
      "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      onSuccess();
    } catch (err) {
      console.error("Copy failed:", err);
    }
    document.body.removeChild(ta);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(onSuccess, onFail);
  } else {
    onFail();
  }
}

function buildStaticBlock(lang: string, rawCode: string): HTMLElement {
  const lines = rawCode !== "" ? rawCode.split("\n") : [""];

  const header = document.createElement("div");
  header.className = "ce-code-header";

  const langLabel = document.createElement("span");
  langLabel.className = "ce-code-lang";
  langLabel.textContent = (lang || "text").toUpperCase();

  const copyBtn = document.createElement("button");
  copyBtn.className = "ce-code-copy";
  copyBtn.type = "button";
  copyBtn.textContent = "Copy";

  const handleCopy = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    performCopy(rawCode, copyBtn);
  };
  copyBtn.addEventListener("click", handleCopy, { passive: false });
  copyBtn.addEventListener("touchend", handleCopy, { passive: false });

  header.append(langLabel, copyBtn);

  const gutter = document.createElement("div");
  gutter.className = "ce-code-gutter";
  lines.forEach((_, i) => {
    const span = document.createElement("span");
    span.className = "ce-code-gutter-line";
    span.textContent = String(i + 1);
    gutter.appendChild(span);
  });

  const content = document.createElement("div");
  content.className = "ce-code-content";
  const pre = document.createElement("pre");
  pre.className = "ce-code-pre";

  lines.forEach((line, i) => {
    const el = document.createElement("span");
    el.className = "ce-code-line";
    el.innerHTML = highlightCode(line, lang) || "\u00A0";
    pre.appendChild(el);
    if (i < lines.length - 1) {
      pre.appendChild(document.createTextNode("\n"));
    }
  });

  content.appendChild(pre);

  const body = document.createElement("div");
  body.className = "ce-code-body";
  body.append(gutter, content);

  const newBlock = document.createElement("div");
  newBlock.className = "ce-code-block";
  newBlock.dataset.codeLang = lang;
  newBlock.dataset.codeText = rawCode;
  newBlock.setAttribute("data-processed", "true");
  newBlock.append(header, body);
  return newBlock;
}

export function processArticleCodeBlocks(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>(".ce-code-block").forEach((block) => {
    const lang = block.dataset.codeLang ?? "text";

    if (block.dataset.processed === "true") {
      const savedCode = block.dataset.codeText ?? "";
      const copyBtn = block.querySelector<HTMLButtonElement>(".ce-code-copy");
      if (copyBtn) {
        const newBtn = copyBtn.cloneNode(true) as HTMLButtonElement;
        const handleCopy = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          performCopy(savedCode, newBtn);
        };
        newBtn.addEventListener("click", handleCopy, { passive: false });
        newBtn.addEventListener("touchend", handleCopy, { passive: false });
        copyBtn.replaceWith(newBtn);
      }
      return;
    }

    let rawCode = "";
    const highlighted = block.querySelector<HTMLElement>(
      "pre code.ce-code-highlighted",
    );
    if (highlighted) {
      const lineDivs = highlighted.querySelectorAll<HTMLElement>("div");
      if (lineDivs.length > 0) {
        rawCode = Array.from(lineDivs)
          .map((div) =>
            (div.textContent ?? "")
              .replace(/\u200B/g, "")
              .replace(/\u00A0/g, " "),
          )
          .join("\n")
          .trimEnd();
      } else {
        rawCode = (highlighted.textContent ?? "")
          .replace(/\u200B/g, "")
          .replace(/\u00A0/g, " ")
          .trimEnd();
      }
    }

    block.replaceWith(buildStaticBlock(lang, rawCode));
  });

  container.querySelectorAll<HTMLElement>(".ce-preline").forEach((el) => {
    el.removeAttribute("contenteditable");
    el.textContent = (el.textContent ?? "").replace(/\u200B/g, "");
  });

  container.querySelectorAll<HTMLElement>(".ce-align-block").forEach((el) => {
    el.removeAttribute("contenteditable");
    el.textContent = (el.textContent ?? "").replace(/\u200B/g, "");
  });
}

function isDarkMode(): boolean {
  const html = document.documentElement;
  const body = document.body;
  const domTheme =
    html.getAttribute("data-theme") ||
    body.getAttribute("data-theme") ||
    (html.classList.contains("dark") || body.classList.contains("dark")
      ? "dark"
      : null);
  if (domTheme) return domTheme === "dark";
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored === "dark";
  } catch (err) {
    console.error(err);
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

const DARK_T = {
  codeBg: "#1a1d2e",
  codeBorder: "rgba(255,255,255,0.07)",
  codeHeaderBg: "#222538",
  codeHeaderBorder: "rgba(255,255,255,0.06)",
  codeLang: "#7c7f9e",
  codeCopy: "#7c7f9e",
  codeCopyBorder: "rgba(255,255,255,0.1)",
  codeText: "#cdd6f4",
  lineNumColor: "#494d6a",
  lineNumBg: "rgba(0,0,0,0.15)",
};
const LIGHT_T = {
  codeBg: "#f8f8f8",
  codeBorder: "#e2e2e2",
  codeHeaderBg: "#efefef",
  codeHeaderBorder: "#e0e0e0",
  codeLang: "#888",
  codeCopy: "#999",
  codeCopyBorder: "#d4d4d4",
  codeText: "#333",
  lineNumColor: "#bbb",
  lineNumBg: "#f0f0f0",
};

let themeObserver: MutationObserver | null = null;

export function applyArticleTheme(): void {
  requestAnimationFrame(() => {
    const dark = isDarkMode();
    const t = dark ? DARK_T : LIGHT_T;
    const root = document.documentElement;

    (
      [
        ["--ce-code-bg", t.codeBg],
        ["--ce-code-border", t.codeBorder],
        ["--ce-code-header-bg", t.codeHeaderBg],
        ["--ce-code-header-border", t.codeHeaderBorder],
        ["--ce-code-lang-color", t.codeLang],
        ["--ce-code-copy-color", t.codeCopy],
        ["--ce-code-copy-border", t.codeCopyBorder],
        ["--ce-code-text", t.codeText],
        ["--ce-line-num-color", t.lineNumColor],
        ["--ce-line-num-bg", t.lineNumBg],
        ["--ce-kw-color", dark ? "#cba6f7" : "#c0392b"],
        ["--ce-str-color", dark ? "#a6e3a1" : "#27ae60"],
        ["--ce-num-color", dark ? "#fab387" : "#e67e22"],
        ["--ce-comment-color", dark ? "#585b70" : "#aaa"],
        ["--ce-tag-color", dark ? "#89b4fa" : "#2980b9"],
      ] as [string, string][]
    ).forEach(([k, v]) => root.style.setProperty(k, v));

    document.querySelectorAll<HTMLElement>(".ce-code-block").forEach((b) => {
      b.style.background = t.codeBg;
      b.style.borderColor = t.codeBorder;
      const hdr = b.querySelector<HTMLElement>(".ce-code-header");
      if (hdr) {
        hdr.style.background = t.codeHeaderBg;
        hdr.style.borderColor = t.codeHeaderBorder;
      }
      const lbl = b.querySelector<HTMLElement>(".ce-code-lang");
      if (lbl) lbl.style.color = t.codeLang;
      const cp = b.querySelector<HTMLElement>(".ce-code-copy");
      if (cp) {
        cp.style.color = t.codeCopy;
        cp.style.borderColor = t.codeCopyBorder;
      }
      const pre = b.querySelector<HTMLElement>(".ce-code-pre");
      if (pre) pre.style.color = t.codeText;
      const gut = b.querySelector<HTMLElement>(".ce-code-gutter");
      if (gut) {
        gut.style.background = t.lineNumBg;
        gut.style.borderRightColor = t.codeBorder;
      }
      b.querySelectorAll<HTMLElement>(".ce-code-gutter-line").forEach((el) => {
        el.style.color = t.lineNumColor;
      });
    });

    document.querySelectorAll<HTMLElement>(".ce-callout").forEach((c) => {
      const bc = c.style.borderLeftColor;
      if (!bc) return;
      const hdr = c.querySelector<HTMLElement>(".ce-callout-header");
      const ttl = c.querySelector<HTMLElement>(".ce-callout-title");
      if (hdr) hdr.style.color = bc;
      if (ttl) ttl.style.color = bc;
    });
  });
}

export function watchThemeChanges(): () => void {
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }

  themeObserver = new MutationObserver(() => applyArticleTheme());

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme", "data-color-scheme"],
  });
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "data-theme", "data-color-scheme"],
  });

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const mqHandler = () => applyArticleTheme();
  mq.addEventListener("change", mqHandler);

  return () => {
    themeObserver?.disconnect();
    themeObserver = null;
    mq.removeEventListener("change", mqHandler);
  };
}

/** @deprecated use applyArticleTheme() */
export const applyCalloutTitleColors = applyArticleTheme;
