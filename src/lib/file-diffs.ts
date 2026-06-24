// Realistic diff hunks for the files in the Gomoku task's Changes card.
// Each file shows an excerpt of its diff (changed hunks + a little context),
// with a footer noting how many additional lines exist.

export type DiffLineType = "hunk" | "context" | "add" | "del";

export interface DiffLine {
  type: DiffLineType;
  oldNo?: number; // line number in the old file (deletions/context)
  newNo?: number; // line number in the new file (additions/context)
  content: string;
}

export interface FileDiff {
  fileId: string;
  name: string;
  language: string;
  diffAdd: number;
  diffDel: number;
  // Total lines shown for the "excerpt" — used for the footer count
  hiddenLines: number;
  lines: DiffLine[];
}

const APP_JS: DiffLine[] = [
  { type: "hunk", content: "@@ -0,0 +1,40 @@" },
  { type: "add", newNo: 1, content: "// Gomoku — Five-in-a-Row with a heuristic AI" },
  { type: "add", newNo: 2, content: "// Player is black (X), the AI is white (O)." },
  { type: "add", newNo: 3, content: "" },
  { type: "add", newNo: 4, content: "const SIZE = 15;" },
  { type: "add", newNo: 5, content: "const board = Array.from({ length: SIZE }, () =>" },
  { type: "add", newNo: 6, content: "  Array.from({ length: SIZE }, () => 0));" },
  { type: "add", newNo: 7, content: "" },
  { type: "add", newNo: 8, content: "let moveCount = 0;" },
  { type: "add", newNo: 9, content: "let currentTurn = 1; // 1 = player, 2 = AI" },
  { type: "add", newNo: 10, content: "" },
  { type: "add", newNo: 11, content: "function inBounds(r, c) {" },
  { type: "add", newNo: 12, content: "  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;" },
  { type: "add", newNo: 13, content: "}" },
  { type: "add", newNo: 14, content: "" },
  { type: "add", newNo: 15, content: "function directions() {" },
  { type: "add", newNo: 16, content: "  return [[0,1],[1,0],[1,1],[1,-1]];" },
  { type: "add", newNo: 17, content: "}" },
  { type: "add", newNo: 18, content: "" },
  { type: "add", newNo: 19, content: "function checkWin(r, c, player) {" },
  { type: "add", newNo: 20, content: "  for (const [dr, dc] of directions()) {" },
  { type: "add", newNo: 21, content: "    let count = 1;" },
  { type: "add", newNo: 22, content: "    for (let s = 1; s < 5; s++) {" },
  { type: "add", newNo: 23, content: "      const nr = r + dr*s, nc = c + dc*s;" },
  { type: "add", newNo: 24, content: "      if (!inBounds(nr, nc) || board[nr][nc] !== player) break;" },
  { type: "add", newNo: 25, content: "      count++;" },
  { type: "add", newNo: 26, content: "    }" },
  { type: "add", newNo: 27, content: "    for (let s = 1; s < 5; s++) {" },
  { type: "add", newNo: 28, content: "      const nr = r - dr*s, nc = c - dc*s;" },
  { type: "add", newNo: 29, content: "      if (!inBounds(nr, nc) || board[nr][nc] !== player) break;" },
  { type: "add", newNo: 30, content: "      count++;" },
  { type: "add", newNo: 31, content: "    }" },
  { type: "add", newNo: 32, content: "    if (count >= 5) return [[dr, dc]];" },
  { type: "add", newNo: 33, content: "  }" },
  { type: "add", newNo: 34, content: "  return null;" },
  { type: "add", newNo: 35, content: "}" },
  { type: "add", newNo: 36, content: "" },
  { type: "add", newNo: 37, content: "// Heuristic: score candidate moves by offensive" },
  { type: "add", newNo: 38, content: "// and defensive patterns, with a center bonus." },
  { type: "add", newNo: 39, content: "function scoreMove(r, c) {" },
  { type: "add", newNo: 40, content: "  if (board[r][c] !== 0) return -1;" },
];

const INDEX_HTML: DiffLine[] = [
  { type: "hunk", content: "@@ -4,9 +4,8 @@" },
  { type: "context", oldNo: 4, newNo: 4, content: "  <head>" },
  { type: "context", oldNo: 5, newNo: 5, content: "    <meta charset=\"UTF-8\" />" },
  { type: "context", oldNo: 6, newNo: 6, content: "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />" },
  { type: "del", oldNo: 7, content: "    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">" },
  { type: "del", oldNo: 8, content: "    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap\" rel=\"stylesheet\">" },
  { type: "add", newNo: 7, content: "    <!-- Removed external web font so the game works offline -->" },
  { type: "add", newNo: 8, content: "    <style>body { font-family: system-ui, sans-serif; }</style>" },
  { type: "context", oldNo: 9, newNo: 9, content: "    <title>Gomoku vs. AI</title>" },
  { type: "context", oldNo: 10, newNo: 10, content: "  </head>" },
  { type: "hunk", content: "@@ -18,6 +17,20 @@" },
  { type: "context", oldNo: 18, newNo: 17, content: "  <body>" },
  { type: "context", oldNo: 19, newNo: 18, content: "    <header>" },
  { type: "add", newNo: 19, content: "      <h1>Gomoku vs. AI</h1>" },
  { type: "add", newNo: 20, content: "      <p>Black: you · White: heuristic AI</p>" },
  { type: "add", newNo: 21, content: "      <div class=\"turn-line\">Turn: <span id=\"turn\">Black</span></div>" },
  { type: "add", newNo: 22, content: "      <div class=\"count-line\">Moves: <span id=\"count\">0</span></div>" },
  { type: "context", oldNo: 20, newNo: 23, content: "    </header>" },
  { type: "add", newNo: 24, content: "    <main>" },
  { type: "add", newNo: 25, content: "      <div id=\"board\" class=\"board\"></div>" },
  { type: "add", newNo: 26, content: "      <aside class=\"panel\">" },
  { type: "add", newNo: 27, content: "        <button id=\"restart\">Restart match</button>" },
  { type: "add", newNo: 28, content: "        <label><input type=\"checkbox\" id=\"focus\" /> Show AI focus area</label>" },
  { type: "add", newNo: 29, content: "      </aside>" },
  { type: "add", newNo: 30, content: "    </main>" },
  { type: "context", oldNo: 21, newNo: 31, content: "    <script src=\"app.js\"></script>" },
];

const STYLES_CSS: DiffLine[] = [
  { type: "hunk", content: "@@ -1,4 +1,22 @@" },
  { type: "context", oldNo: 1, newNo: 1, content: ":root {" },
  { type: "del", oldNo: 2, content: "  --line: #ccc;" },
  { type: "add", newNo: 2, content: "  --line: oklch(0.7 0 0);" },
  { type: "add", newNo: 3, content: "  --board: #e8c97a;" },
  { type: "add", newNo: 4, content: "  --black: #1a1a1a;" },
  { type: "add", newNo: 5, content: "  --white: #f8f8f8;" },
  { type: "add", newNo: 6, content: "  --accent: #3b82f6;" },
  { type: "context", oldNo: 3, newNo: 7, content: "}" },
  { type: "add", newNo: 8, content: "" },
  { type: "add", newNo: 9, content: ".board {" },
  { type: "add", newNo: 10, content: "  display: grid;" },
  { type: "add", newNo: 11, content: "  grid-template-columns: repeat(15, 1fr);" },
  { type: "add", newNo: 12, content: "  gap: 0;" },
  { type: "add", newNo: 13, content: "  width: min(90vw, 540px);" },
  { type: "add", newNo: 14, content: "  aspect-ratio: 1;" },
  { type: "add", newNo: 15, content: "  background: var(--board);" },
  { type: "add", newNo: 16, content: "  border: 2px solid var(--line);" },
  { type: "add", newNo: 17, content: "  border-radius: 6px;" },
  { type: "add", newNo: 18, content: "}" },
  { type: "add", newNo: 19, content: "" },
  { type: "add", newNo: 20, content: "@media (max-width: 480px) {" },
  { type: "add", newNo: 21, content: "  .board { width: 96vw; }" },
  { type: "add", newNo: 22, content: "  .panel { display: none; }" },
  { type: "add", newNo: 23, content: "}" },
];

export const fileDiffs: Record<string, FileDiff> = {
  "fc-1": {
    fileId: "fc-1",
    name: "app.js",
    language: "javascript",
    diffAdd: 471,
    diffDel: 0,
    hiddenLines: 471 - APP_JS.filter((l) => l.type === "add").length,
    lines: APP_JS,
  },
  "fc-2": {
    fileId: "fc-2",
    name: "index.html",
    language: "html",
    diffAdd: 62,
    diffDel: 6,
    hiddenLines:
      62 - INDEX_HTML.filter((l) => l.type === "add").length,
    lines: INDEX_HTML,
  },
  "fc-3": {
    fileId: "fc-3",
    name: "styles.css",
    language: "css",
    diffAdd: 201,
    diffDel: 1,
    hiddenLines:
      201 - STYLES_CSS.filter((l) => l.type === "add").length,
    lines: STYLES_CSS,
  },
};
