# GitPet

GitPet turns any public GitHub profile into a living pixel companion.
Swap the domain and meet your pet:

```txt
github.com/khanhvinhnguyen
        ↓
gitpet.com/khanhvinhnguyen
```

The pet is built from three layers of public data:

1. **Stable identity** — species, palette, personality and name are derived from a
   deterministic hash of the username. Refreshing never rerolls the pet.
2. **Fusion appearance** — the GitHub-visible language mix maps to tech archetypes
   (`interface`, `backend`, `systems`, `data`) that dress the pet: outfit,
   workstation, room theme, accessory and ambient effect.
3. **Daily state** — recent public activity picks today's mood and action.
   Quiet weeks mean rest, never punishment. GitPet is not a productivity score.

## Embed in your GitHub profile README

Every pet ships as an animated SVG card:

```markdown
[![My GitPet](https://<your-deployment>/api/card/<username>)](https://<your-deployment>/<username>)
```

## Architecture

```txt
src/
├── app/
│   ├── page.tsx                  # landing (demo pet from fixtures)
│   ├── [username]/page.tsx       # server-rendered pet profile
│   └── api/card/[username]/      # animated SVG card for README embeds
├── components/                   # client components (search form, copy buttons)
└── lib/
    ├── pet-engine/               # pure TS: identity, archetypes, fusion, daily state
    ├── pet-renderer/             # pure TS: pixel sprites → SVG (scene, card, standalone)
    └── github/                   # server-side collector with cached fetches
```

Design rules:

- `pet-engine` and `pet-renderer` are pure TypeScript with no framework
  dependency — the same code powers the web scene, the README card and fixtures.
- All generation is deterministic and versioned (`identityVersion`,
  `fusionVersion`, `assetVersion`). Algorithm changes must bump a version.
- GitHub is only called from the server, with Next.js data-cache TTLs
  (profile 24h, repos 12h, events 30m). No token required; set `GITHUB_TOKEN`
  in the environment to raise rate limits.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and try `http://localhost:3000/khanhvinhnguyen`.
No environment variables are required.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + custom CSS
- Zod for the versioned `GitPetProfile` contract
- GitHub public REST API (server-side only)

## Privacy and API limits

GitPet reads public profile, repository and event metadata only. It never asks
for login or private repository access. Unauthenticated GitHub API rate limits
apply and are absorbed by server-side caching.
