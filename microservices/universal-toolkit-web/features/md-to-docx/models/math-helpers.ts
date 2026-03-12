// features/md-to-docx/models/math-helpers.ts
//
// Math support for MD → DOCX conversion:
// - Adds $$...$$ (block) and $...$ (inline) tokenization via marked extension
// - Fetches OMML from server-side API (/api/md-to-docx/render-math)
// - Creates DOCX-compatible ParagraphChild from OMML XML

import { Marked, type Token } from "marked";
import { convertToXmlComponent, type ParagraphChild } from "docx";
import { xml2js, type Element } from "xml-js";

// ──────────────────────────────────────────────────────────────────────────────
// Marked instance with math extensions
// ──────────────────────────────────────────────────────────────────────────────

let _markedInstance: Marked | null = null;

/** Returns a singleton Marked instance extended with math block/inline rules. */
export function getMarkedInstance(): Marked {
  if (_markedInstance) return _markedInstance;

  const instance = new Marked();

  instance.use({
    extensions: [
      {
        // Block math: $$ ... $$ on its own line(s)
        name: "mathBlock",
        level: "block",
        start(src: string) {
          return src.indexOf("$$");
        },
        tokenizer(src: string) {
          const match = /^\$\$([\s\S]+?)\$\$/.exec(src);
          if (match) {
            return {
              type: "mathBlock",
              raw: match[0],
              latex: match[1].trim(),
            };
          }
        },
      },
      {
        // Inline math: $...$ within a paragraph
        // Negative lookahead (?!\$) prevents matching $$
        name: "mathInline",
        level: "inline",
        start(src: string) {
          return src.indexOf("$");
        },
        tokenizer(src: string) {
          const match = /^\$(?!\$)((?:[^$\\\n]|\\.)+?)\$/.exec(src);
          if (match) {
            return {
              type: "mathInline",
              raw: match[0],
              latex: match[1].trim(),
            };
          }
        },
      },
    ],
  });

  _markedInstance = instance;
  return instance;
}

// ──────────────────────────────────────────────────────────────────────────────
// Formula extraction (walk token tree)
// ──────────────────────────────────────────────────────────────────────────────

export interface MathFormula {
  latex: string;
  displayMode: boolean;
}

function walkTokens(tokens: Token[], seen: Map<string, boolean>): void {
  for (const token of tokens) {
    const t = token as Record<string, unknown>;

    if (token.type === "mathBlock" && typeof t.latex === "string") {
      seen.set(t.latex as string, true);
    } else if (token.type === "mathInline" && typeof t.latex === "string") {
      if (!seen.has(t.latex as string)) {
        seen.set(t.latex as string, false);
      }
    }

    // Recurse into nested tokens
    if ("tokens" in token && Array.isArray(token.tokens)) {
      walkTokens(token.tokens as Token[], seen);
    }
    if (
      "items" in token &&
      Array.isArray((token as { items: unknown[] }).items)
    ) {
      for (const item of (token as { items: { tokens?: Token[] }[] }).items) {
        if (item.tokens) walkTokens(item.tokens, seen);
      }
    }
  }
}

/**
 * Walk the marked token tree and collect unique LaTeX formulas.
 * Returns deduplicated list with correct displayMode flag.
 */
export function extractMathFormulas(tokens: Token[]): MathFormula[] {
  // Map<latex, displayMode> — a formula found as block wins display=true
  const seen = new Map<string, boolean>();
  walkTokens(tokens, seen);
  return Array.from(seen.entries()).map(([latex, displayMode]) => ({
    latex,
    displayMode,
  }));
}

// ──────────────────────────────────────────────────────────────────────────────
// API call: LaTeX → OMML
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Call the server-side API to convert LaTeX formulas to OMML.
 * Returns a Map<latex, ommlXmlString>.
 * Falls back gracefully: failed formulas are simply absent from the map.
 */
export async function prefetchMathOmml(
  formulas: MathFormula[],
): Promise<Map<string, string>> {
  const cache = new Map<string, string>();
  if (formulas.length === 0) return cache;

  try {
    const response = await fetch("/api/md-to-docx/render-math", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formulas }),
    });

    if (!response.ok) {
      console.warn(
        `[md-to-docx] Math API returned ${response.status}. Formulas will be rendered as plain text.`,
      );
      return cache;
    }

    const data = (await response.json()) as {
      results: ({ omml: string } | { error: string; latex: string })[];
    };

    formulas.forEach((formula, i) => {
      const result = data.results[i];
      if (result && "omml" in result) {
        cache.set(formula.latex, result.omml);
      }
    });
  } catch (err) {
    console.warn(
      "[md-to-docx] Failed to prefetch math OMML. Formulas will be rendered as plain text.",
      err,
    );
  }

  return cache;
}

// ──────────────────────────────────────────────────────────────────────────────
// DOCX embedding helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Parse an OMML XML string and return a docx ParagraphChild.
 *
 * Root cause of the previous approach failure:
 * `ImportedXmlComponent.fromXmlString(xml)` passes the xml-js root WRAPPER
 * object (which has `type: undefined` and `name: undefined`) to
 * `convertToXmlComponent()`, producing an outer container with
 * `rootKey = undefined`. When serialized this becomes `<undefined>...</undefined>`,
 * corrupting the DOCX file.
 *
 * Fix: use `convertToXmlComponent()` directly on `elements[0]` (the actual
 * XML element), bypassing the wrapper entirely.
 */
export function ommlToParagraphChild(omml: string): ParagraphChild | null {
  try {
    const parsed = xml2js(omml, { compact: false }) as {
      elements?: Element[];
    };
    const element = parsed.elements?.[0];
    if (!element) return null;
    const comp = convertToXmlComponent(element);
    if (!comp || typeof comp === "string") return null;
    return comp as unknown as ParagraphChild;
  } catch (err) {
    console.warn("[md-to-docx] Failed to parse OMML:", err);
    return null;
  }
}

const M_NS =
  'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"';

/**
 * Wrap an <m:oMath> element in <m:oMathPara> for display/block mode.
 * Word renders <m:oMathPara> as a centered, standalone equation.
 */
export function wrapInMathPara(omml: string): string {
  return `<m:oMathPara ${M_NS}>${omml}</m:oMathPara>`;
}
