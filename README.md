# CS2 Movement Guide

    npm install
    npm run dev        # http://localhost:3000, content reloads on each request
    npm run validate   # checks guide.json and that every [[link]] resolves

## Where things live
- `content/guide.json`: modules, sections, dictionary terms, resources, sources, module quizzes
- `content/animations.js`: every keyboard animation and chart, with comments. Edit keys, order and speed (ms) here
- `content/autoexec/`: the two autoexec text files shown in the Autoexec module
- `content/archive/guide-v1.json`: the previous content, kept so nothing is lost
- `docs/REMOVED_ITEMS.md`: what was removed or moved, why, and what needs confirming
- `src/`: Express app, content loader, rich text renderer
- `views/`: EJS partials. `public/`: CSS and JS modules (one job per file)

## Writing content
- Hover links: `[[id|label]]`. `id` is a dictionary term or a section. Hover shows the term's `short` line. Click goes to its section, Ctrl-click opens the dictionary book. A term with no `section` opens the book straight away. Each term is underlined once per subsection.
- External link: `[text](https://...)`. Command with copy button: `` `cl_showpos 1` ``.
- Clips: put `.webm` or `.mp4` in `public/media/` and set the section's `media.src` to `/media/name.webm`.
- A module quiz needs `checklist` (techniques to try), `quiz` (3+ questions) and optional `checklistRequired`.
- Map routes: add a section to `cat-maps` with `"group": "de_mirage"`.

## Status
Phases 0 to 4 are done. Next: more map routes, more clips, and a second pass on any section you flag.
