# Third-Party Notices

This file lists the licenses of third-party software used by **zcode-workspace**.
The project itself is provided as-is; see its own license for terms governing
this codebase.

## Project license

This project does not currently declare a top-level license file. All
third-party dependencies retain their original licenses as specified in their
respective packages.

## Major direct dependencies

Licenses below are as published by each project; "see package" means the license
should be confirmed in the installed package's `package.json` / `LICENSE`.

| Dependency | License | Notes |
|---|---|---|
| next | MIT | App framework |
| react / react-dom | MIT | UI runtime |
| @prisma/client / prisma | Apache-2.0 | ORM + SQLite |
| @tanstack/react-query | MIT | Server state |
| @tanstack/react-table | MIT | Tables |
| zustand | MIT | Client state |
| zod | MIT | Schema validation |
| react-hook-form | MIT | Forms |
| @hookform/resolvers | MIT | zod resolver for RHF |
| tailwindcss | MIT | Styling |
| @radix-ui/* (multiple) | MIT | Primitives (shadcn/ui) |
| class-variance-authority | Apache-2.0 | Variant styling |
| clsx | MIT | Class composition |
| tailwind-merge | MIT | Class dedupe |
| cmdk | MIT | Command palette |
| lucide-react | ISC | Icons |
| framer-motion | MIT | Animation |
| recharts | MIT | Charts |
| date-fns | MIT | Date utilities |
| next-auth | ISC | Auth |
| next-intl | MIT | i18n |
| next-themes | MIT | Theme switching |
| sonner | MIT | Toasts |
| vaul | MIT | Drawer |
| embla-carousel-react | MIT | Carousel |
| react-markdown | MIT | Markdown render |
| react-syntax-highlighter | MIT | Code highlight |
| react-resizable-panels | MIT | Resizable panels |
| react-day-picker | Apache-2.0 | Date picker |
| input-otp | MIT | OTP input |
| sharp | Apache-2.0 | Image optimization |
| socket.io-client | MIT | WebSocket client (sim sidecar) |
| uuid | MIT | ID generation |
| @dnd-kit/* | MIT | Drag and drop |
| @reactuses/core | MIT | React hooks |
| @mdxeditor/editor | MIT | MDX editor |
| z-ai-web-dev-sdk | see package | AI SDK |

Dependencies marked "see package" or not listed should be confirmed in their
installed `package.json`. Transitive dependencies are governed by their own
licenses and are not enumerated here.

## Architectural inspiration (no code copied)

Some architectural patterns in this project were inspired by the MIT-licensed
**Synara** project (https://github.com/Emanuele-web04/synara,
`Copyright (c) 2026 T3 Tools Inc.`) — for example: dual `AGENTS.md`/`CLAUDE.md`
agent-convention docs, the CI quality-gate + build-output assertion pattern,
PR-triage automation, tsconfig strictness discipline, and the centralized
schema/contract boundary concept.

These are **pattern adoptions only** — no source code from Synara was copied
verbatim into this project. Ideas, architecture, and conventions are not
copyrightable, so no license obligation attaches. Should any literal Synara code
ever be incorporated in the future, the full MIT notice below must be preserved
alongside it.

> MIT License
> Copyright (c) 2026 T3 Tools Inc.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## Updating this file

When adding a significant new direct dependency, add a row to the table above
with its license. This file is a living document, not a one-time artifact.
