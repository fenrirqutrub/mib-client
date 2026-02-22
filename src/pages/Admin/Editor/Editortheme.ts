const cssVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function getThemeTokens() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";

  return {
    dark,
    codeBg: cssVar("--code-bg"),
    codeHdrBg: cssVar("--code-hdr-bg"),
    codeBorder: cssVar("--code-border"),
    codeHdrBorder: cssVar("--code-hdr-border"),
    codeText: cssVar("--code-text"),
    codeLang: cssVar("--code-lang"),
    codeCopy: cssVar("--code-copy"),
    codeCopyBorder: cssVar("--code-copy-border"),
    lineNumBg: cssVar("--code-line-num-bg"),
    lineNumColor: cssVar("--code-line-num-color"),
    lineNumBorder: cssVar("--code-line-num-border"),
  };
}

export function updateEditorTheme(forceTheme?: "dark" | "light") {
  if (forceTheme) {
    try {
      localStorage.setItem("theme", forceTheme);
    } catch (err) {
      console.error(err);
    }
    document.documentElement.setAttribute("data-theme", forceTheme);
  }

  const tk = getThemeTokens();

  document.querySelectorAll<HTMLElement>(".ce-code-block").forEach((block) => {
    block.style.background = tk.codeBg;
    block.style.borderColor = tk.codeBorder;

    const hdr = block.querySelector<HTMLElement>("div:first-child");
    if (hdr) {
      hdr.style.background = tk.codeHdrBg;
      hdr.style.borderColor = tk.codeHdrBorder;
    }

    const lbl = hdr?.querySelector<HTMLElement>("span");
    if (lbl) lbl.style.color = tk.codeLang;

    const btn = hdr?.querySelector<HTMLElement>("button");
    if (btn) {
      btn.style.color = tk.codeCopy;
      btn.style.borderColor = tk.codeCopyBorder;
    }

    const pre = block.querySelector<HTMLElement>("pre");
    if (pre) pre.style.color = tk.codeText;

    const body = block.querySelector<HTMLElement>("div:nth-child(2)");
    const gutter = body?.firstElementChild as HTMLElement | null;
    if (gutter) {
      gutter.style.background = tk.lineNumBg;
      gutter.style.borderRightColor = tk.lineNumBorder;
      gutter.style.color = tk.lineNumColor;
      gutter.querySelectorAll<HTMLElement>("div").forEach((d) => {
        d.style.color = tk.lineNumColor;
      });
    }
  });
}
