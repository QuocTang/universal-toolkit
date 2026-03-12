// app/api/md-to-docx/render-math/route.ts
//
// Server-side API route: converts LaTeX formulas → OMML (Office Math Markup Language)
// Uses latex-to-omml which depends on mathjax-node (Node.js only, not browser-compatible)

import { NextRequest, NextResponse } from "next/server";

// Dynamic import to ensure this only runs server-side
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { latexToOMML } = require("latex-to-omml") as {
  latexToOMML: (
    latex: string,
    options?: { displayMode?: boolean },
  ) => Promise<string>;
};

interface MathFormula {
  latex: string;
  displayMode: boolean;
}

interface RenderMathRequest {
  formulas: MathFormula[];
}

type FormulaResult = { omml: string } | { error: string; latex: string };

export async function POST(request: NextRequest) {
  let body: RenderMathRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { formulas } = body;

  if (!Array.isArray(formulas)) {
    return NextResponse.json(
      { error: "formulas must be an array" },
      { status: 400 },
    );
  }

  const results: FormulaResult[] = await Promise.all(
    formulas.map(async ({ latex, displayMode }) => {
      try {
        const omml = await latexToOMML(latex, { displayMode });
        return { omml };
      } catch (err) {
        console.error(`Failed to convert LaTeX: ${latex}`, err);
        return {
          error: err instanceof Error ? err.message : "Conversion failed",
          latex,
        };
      }
    }),
  );

  return NextResponse.json({ results });
}
