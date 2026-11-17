import type { ReactNode } from "react";
import CopyButton from "./CopyButton";

type Lang = "ts" | "bash" | "json" | "text";

const KEYWORDS = new Set([
  "import", "export", "from", "type", "const", "let", "async", "await",
  "return", "if", "new", "catch", "true", "false", "null", "undefined",
]);

const PATTERNS: Record<Exclude<Lang, "text">, RegExp> = {
  // comment | string | identifier followed by "(" | bare word
  ts: /(\/\/.*$)|("[^"\n]*"|'[^'\n]*'|`[^`]*`)|\b([A-Za-z_$][\w$]*)(?=\s*\()|\b([A-Za-z_]\w*)\b/gm,
  // comment | string | literal
  json: /(\/\/.*$)|("[^"\n]*")|\b(true|false|null)\b/gm,
  // comment | string | the claude command
  bash: /(#.*$)|("[^"\n]*"|'[^'\n]*')|\b(claude)\b/gm,
};

/** Tiny, dependency-free highlighter: comments, strings, keywords, calls. */
function highlight(code: string, lang: Lang): ReactNode[] {
  if (lang === "text") return [code];
  const re = new RegExp(PATTERNS[lang].source, PATTERNS[lang].flags);
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[0] === "") {
      re.lastIndex++;
      continue;
    }
    const [tok, comment, str, call, word] = m;
    let cls: string | null = null;
    if (comment) cls = "tok-c";
    else if (str) cls = "tok-s";
    else if (call) cls = KEYWORDS.has(call) ? "tok-k" : "tok-f";
    else if (word && (lang === "json" || KEYWORDS.has(word))) cls = "tok-k";
    if (!cls) continue;
    if (m.index > last) out.push(code.slice(last, m.index));
    out.push(
      <span key={key++} className={cls}>
        {tok}
      </span>
    );
    last = m.index + tok.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export default function CodeBlock({
  code,
  lang = "text",
  label,
}: {
  code: string;
  lang?: Lang;
  label?: string;
}) {
  const text = code.replace(/^\n+/, "").replace(/\s+$/, "");
  return (
    <div className="code">
      <div className="code-head">
        <span>{label ?? lang}</span>
        <CopyButton text={text} />
      </div>
      <pre tabIndex={0}>
        <code>{highlight(text, lang)}</code>
      </pre>
    </div>
  );
}
