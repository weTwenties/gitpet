# GitPet

GitPet turns a public GitHub profile into a living pixel companion. Repository
languages shape the species, recent activity affects its level and features,
and collaboration signals unlock fusion traits.

**Live demo:** https://gitpet-lab.vinhnk-work.chatgpt.site

## First-hatch experience

- Search any public GitHub username without signing in.
- Generate a deterministic pet profile from public events and repositories.
- Explain why each visible trait exists through the Pet Genome.
- Show a four-stage evolution path: Hatchling, Scout, Ranger, and Guardian.
- Adapt the habitat and layout for desktop and mobile.

## Pet genome

| Trait | Public signal | Effect |
| --- | --- | --- |
| Body | Most common repository language | Base species and palette |
| Ears | Recent commits | Sharper or softer features |
| Tail | Pull requests and reviews | Solo or fusion anatomy |
| Aura | Active days | Resting or steady glow |
| Level | Weighted activity score | Evolution stage |

The current contribution grid is a stylized visualization. GitHub's unauthenticated
public Events API does not expose a complete contribution calendar.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. No environment variables or GitHub token are
required for the first version.

## Publish this source

After extracting the archive:

```bash
git init
git add .
git commit -m "initialize GitPet"
git branch -M main
git remote add origin https://github.com/weTwenties/gitpet.git
git push -u origin main
```

## Stack

- Next.js / React
- TypeScript
- Tailwind CSS plus custom CSS pixel art
- GitHub public REST API
- Standard Next.js runtime

## Product direction

The next product layer is a stable `/username` profile URL with persistent pet
state. After that, the genome can expand into tech-stack fusion, team habitats,
seasonal items, and shareable cards.

## Privacy and API limits

GitPet reads public profile, repository, and event metadata only. It does not
request access to private repositories. Unauthenticated GitHub API rate limits
still apply.
