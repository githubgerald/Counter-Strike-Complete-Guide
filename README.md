# Counter-Strike Complete Guide

A single-page web guide for learning CS2 movement and technique, built as a lightweight Express + EJS app. The project turns structured JSON content into a navigable learning experience with checklists, quizzes, animated key cues, graphs, a glossary, and local progress tracking.

## Overview

This repository contains a CS2 movement guide site focused on practical technique, from the basics of movement and velocity through advanced movement concepts like bunny hopping, air strafing, ladder movement, and jump mechanics. The content is written as structured data in `content/guide.json`, rendered into pages using EJS templates, and delivered through a small Node.js web server.

The project is intentionally content-driven: most of the learning material lives in data files rather than hardcoded HTML, which makes it easy to add new sections, update explanations, and maintain the site as a guidebook.

## What the project does

The app serves a browser-based guide that includes:

- structured CS2 movement lessons by category and section
- progress tracking with checklists and module quizzes
- animated keyboard cue diagrams for movement inputs
- chart-based visual explanations for speed and movement concepts
- a built-in dictionary/glossary for movement terminology
- resources and references sections
- local browser settings for theme, mode, and reading size
- export/import support for user progress backups

It is not a game or a multiplayer tool. It is a reference-and-learning site for movement concepts in Counter-Strike 2.

## Features

### Interactive learning flow

Each module can contain:

- a checklist of tasks to try in-game
- a quiz to confirm understanding
- animated visual cues for movement inputs
- optional graphs showing speed or trajectory concepts

The site tracks completed modules in browser storage (`localStorage`) and marks them as done once the learner completes the quiz.

### Guided and reference modes

The app supports two display modes:

- `guided`: includes checklists and module quizzes
- `reference`: keeps the page focused on reading and reference material

Users can adjust theme (`system`, `light`, `dark`) and text size (`small`, `medium`, `large`) via the settings panel.

### Dictionary / glossary

The app includes a dictionary overlay with definitions for movement-specific terms. These entries are defined in the guide data and are rendered dynamically.

### Media-ready content structure

The content model supports section media, including local media files under `public/media/`. The project documentation explicitly notes that you can add your own licensed or self-recorded demos and set section media paths accordingly.

### Content validation

The repository includes a validation script that checks:

- JSON structure integrity
- required content fields and IDs
- duplicate IDs
- broken internal `[[term|id]]` links
- animation metadata validity

This helps keep the guide consistent before publication.

## Tech stack

- Node.js
- Express
- EJS
- Vanilla JavaScript for frontend interactivity
- CSS for styling and layout
- JSON for content-driven sections and terms

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── content/
│   ├── animations.js
│   ├── guide.json
│   ├── autoexec/
│   │   ├── full.cfg
│   │   └── minimal.cfg
│   └── archive/
│       ├── guide-v1.json
│       └── guide-v2-phase1.json
├── docs/
│   └── REMOVED_ITEMS.md
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── book.js
│   │   ├── copy.js
│   │   ├── graphs.js
│   │   ├── key-cues.js
│   │   ├── main.js
│   │   ├── navigation.js
│   │   ├── observers.js
│   │   ├── progress.js
│   │   ├── quiz.js
│   │   ├── settings.js
│   │   ├── theme.js
│   │   └── tooltip.js
│   ├── media/
│   │   ├── README.md
│   │   └── (video/gif assets go here)
│   └── (static assets)
├── scripts/
│   └── validate-content.js
├── src/
│   ├── app.js
│   ├── config.js
│   ├── routes/
│   │   └── index.js
│   └── services/
│       ├── content.js
│       └── richText.js
├── views/
│   ├── index.ejs
│   └── partials/
│       ├── autoexec-boxes.ejs
│       ├── bibliography.ejs
│       ├── block.ejs
│       ├── book.ejs
│       ├── category.ejs
│       ├── key-cue.ejs
│       ├── media.ejs
│       ├── module-quiz.ejs
│       ├── resources.ejs
│       ├── section.ejs
│       ├── settings.ejs
│       └── sidebar.ejs
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
├── README.md
└── LICENSE (if added later)
```

## Key code paths

- `server.js` starts the Express app
- `src/app.js` configures middleware, static hosting, and error handling
- `src/routes/index.js` renders the home page
- `src/services/content.js` loads, validates, and enriches the guide data
- `content/guide.json` contains the actual educational content
- `content/animations.js` defines the animated keyboard and graph sequences
- `views/` holds the EJS templates for the site structure
- `public/js/` contains all client-side behaviors

## How content is organized

### `content/guide.json`

This is the main content file. It contains:

- site metadata (`title`, `tagline`, `description`)
- categories and sections
- quiz and checklist data
- terms for the dictionary
- resources and bibliography entries

### `content/animations.js`

This file defines the animated key cues and graph diagrams used alongside certain sections. It is read at runtime and matched against section IDs.

### `content/autoexec/*.cfg`

The repository contains sample autoexec configs:

- `full.cfg`
- `minimal.cfg`

These likely provide practical movement-related commands and setup snippets for the guide.

## Install

From the project root:

```bash
npm install
```

This installs the app dependencies declared in `package.json`.

## Run

Start the application:

```bash
npm start
```

The app listens on:

- host: `127.0.0.1` by default
- port: `3000` by default

You can override these with environment variables:

```bash
HOST=0.0.0.0 PORT=8080 npm start
```

For development with automatic reload on file changes:

```bash
npm run dev
```

Then open the app in a browser at:

```text
http://127.0.0.1:3000
```

## Validate content

The project includes a validation script to check that the guide data and internal references are consistent:

```bash
npm run validate
```

This validates the site data and checks that every linked term resolves to a valid section or glossary entry.

## CI

The repository includes a GitHub Actions workflow in `.github/workflows/ci.yml` that:

- installs dependencies
- checks JavaScript syntax
- runs the content validation script

This gives a clean, repeatable validation path for pull requests and changes.

## Notes and assumptions

- The project stores learning progress in the browser, not in a backend database.
- The site is designed for static educational content and local practice flows.
- Media assets are intentionally placed under `public/media/` and referenced by local paths (for example `/media/filename.webm`).
- The project is a documentation/education app, not a real-time game server or simulation.

## Summary

This repository is a content-driven CS2 movement learning site built with Express and EJS. It turns structured guide data into an interactive, friendly, and instructional experience for learning movement techniques, with built-in progression tracking, visual aids, and a local reference dictionary. The app is easy to extend by updating `content/guide.json`, `content/animations.js`, and the template files under `views/`.

## License

No license file is present in this repository at the time of analysis, so the project is currently unlicensed unless otherwise specified by the repository owner.

---

If you want, I can also turn this into a shorter GitHub-friendly README version optimized for first-time visitors, or expand it with a screenshot section and contribution guidelines.
