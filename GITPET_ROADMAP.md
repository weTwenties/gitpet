# GitPet V1 Roadmap

GitPet là một web app cho phép truy cập pet của bất kỳ GitHub user nào bằng cách thay domain GitHub bằng GitPet:

```txt
github.com/khanhvinhnguyen
        ↓
gitpet.com/khanhvinhnguyen
```

Pet được tạo từ ba lớp dữ liệu:

1. **Stable identity** — cố định theo GitHub username.
2. **Fusion appearance** — biến đổi theo GitHub-visible technology profile.
3. **Daily state** — thay đổi theo hoạt động GitHub gần đây.

GitPet không phải công cụ chấm năng suất, kỹ năng hay seniority.

---

## Tiến độ (cập nhật 2026-07-12)

**Prototype V0.2** — engine + renderer + route `/:username` + README card đã chạy local.

| Phase | Trạng thái | Ghi chú |
| --- | --- | --- |
| 0 Foundation | ~40% | Next.js single app, chưa monorepo / test / CI |
| 1 Route shell | ~90% | Thiếu stale-cache UI riêng |
| 2 GitHub collector | ~85% | Server-side + TTL cache; chưa stale fallback |
| 3 Archetypes | ~80% | Chưa hysteresis theo thời gian |
| 4 Identity | ~90% | Chưa unit test |
| 5 Fusion | ~75% | Trait slot cơ bản; chưa conflict rules đầy đủ |
| 6 Daily state | ~85% | Chưa animation PR/review riêng |
| 7 PetProfile contract | ✅ | Zod schema + versioning |
| 8 Web scene | ~85% | SVG layered (chưa PixiJS) |
| 9 Testing | ~5% | Chỉ có `demoEngineInput` fixture |
| 10 CI/CD | 0% | Dự kiến Vercel |
| 11 Launch docs | ~20% | README cập nhật |

### Stack thực tế (điều chỉnh so với roadmap gốc)

| Roadmap gốc | Hiện tại |
| --- | --- |
| pnpm monorepo `apps/web` + `apps/api` | npm, single Next.js app trong `src/` |
| Vite + React Router | Next.js 16 App Router |
| PixiJS / Canvas 2D | SVG pixel renderer (string-based, reuse 3 nơi) |
| Cloudflare Worker + KV | Next.js server components + Route Handlers + `fetch` cache |
| Cloudflare Pages | **Dự kiến Vercel** (free tier) |

### Cấu trúc hiện tại

```txt
gitpet/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # landing
│   │   ├── [username]/                 # profile full-screen
│   │   └── api/card/[username]/        # SVG embed cho README  ← ngoài roadmap gốc
│   ├── components/
│   └── lib/
│       ├── pet-engine/                 # identity, archetypes, fusion, state, schema
│       ├── pet-renderer/               # sprites → SVG scene / card / standalone
│       └── github/                     # server-side collector
├── public/
└── GITPET_ROADMAP.md
```

### Bước tiếp theo ưu tiên

```txt
1. Vitest + fixtures (Phase 9)
2. .env.example + script typecheck
3. Deploy Vercel
4. Hysteresis archetype + stale-cache fallback
5. E2E Playwright smoke
```

---

## Product principles

- [x] Cùng username luôn tạo ra cùng base pet khi cùng algorithm version.
- [x] Tech stack chỉ thay đổi trait, outfit, workstation, room và effect; không thay toàn bộ pet ngẫu nhiên.
- [x] Daily activity thay đổi mood/action nhanh hơn appearance.
- [x] Pet không chết và không trừng phạt user khi nghỉ.
- [x] UI phải ghi rõ kết quả dựa trên **public GitHub-visible activity**.
- [x] Refresh trang không được reroll pet *(identity ổn định; mood có thể đổi khi GitHub data đổi — đúng thiết kế)*.
- [x] Mọi thuật toán generation đều deterministic và versioned.
- [x] Không hiển thị progress bar kỹ năng, phần trăm thành thạo hay developer ranking.

---

# Phase 0 — Repository foundation

## Workspace

- [ ] Khởi tạo pnpm workspace. *(đang dùng npm single app)*
- [x] Bật TypeScript strict mode.
- [x] Thêm ESLint.
- [ ] Thêm Prettier.
- [ ] Thêm Vitest.
- [ ] Thêm Playwright.
- [x] Tạo root scripts: `dev`, `lint`, `build`.
- [ ] Tạo root scripts: `typecheck`, `test`.
- [ ] Tạo `.env.example` không chứa credential thật.
- [x] Viết README ngắn mô tả product, architecture và scope V1.

## Proposed structure

*Roadmap gốc đề xuất monorepo — hiện tại gom logic vào `src/lib/` thay vì `packages/`.*

```txt
gitpet/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── github-activity/
│   ├── pet-engine/
│   ├── pet-renderer/
│   └── shared/
├── fixtures/
├── docs/
└── tests/
```

## Technology choice

- [x] Frontend: React + TypeScript. *(Next.js thay Vite)*
- [x] Routing: App Router `/:username`. *(thay React Router)*
- [x] Scene renderer: SVG layered pixel art. *(thay PixiJS — cùng assets dùng cho web + README card)*
- [x] API: Next.js Route Handlers + server components. *(thay Cloudflare Worker)*
- [ ] API framework: Hono hoặc TypeScript handler gọn. *(không cần — Next.js đủ)*
- [x] Validation: Zod.
- [x] Cache: Next.js `fetch` revalidate theo TTL. *(thay Cloudflare KV)*
- [ ] Hosting: Vercel *(đã chọn, chưa deploy)* / Cloudflare Pages + Workers.

---

# Phase 1 — Public route and application shell

- [x] Implement route `/:username`.
- [x] Normalize username casing an toàn *(redirect về canonical login từ GitHub)*.
- [x] Loading state.
- [x] User not found state.
- [x] GitHub rate limit / unavailable state.
- [x] `lastSyncedAt` hiển thị trên profile.
- [ ] Stale-cache state *(UI riêng khi serve data cũ — chưa có)*
- [x] Canonical URL cho từng username.
- [x] Responsive shell desktop/mobile.
- [x] Share/copy-link action *(profile link + README embed markdown)*.

### Definition of done

```txt
/:username
→ resolve public GitHub user          ✅
→ return PetProfile (Zod-validated)   ✅  (vượt mức placeholder)
→ render ổn định                    ✅
→ không expose GitHub credential    ✅
```

---

# Phase 2 — GitHub data collector

## Public profile

- [x] Fetch GitHub user theo login.
- [x] Chỉ đọc field public cần thiết.
- [x] Handle unavailable account *(404 → not-found page)*.
- [x] Handle renamed account *(canonical redirect theo `user.login`)*.
- [ ] Handle suspended account *(chưa phân biệt riêng)*.

## Contributions

- [x] Fetch recent public events *(thay contribution calendar — API không auth không có full grid)*.
- [x] Normalize thành activity bands:
  - `none`
  - `light`
  - `active`
  - `intense`
- [ ] Loại GitPet automation activity nếu có thể.
- [x] Không dùng raw commit count làm productivity score.

## Repositories and languages

- [x] Fetch số lượng repo public có giới hạn *(per_page=100)*.
- [x] Bỏ fork mặc định.
- [x] Bỏ archived repo.
- [x] Bỏ chính repo GitPet.
- [x] Thêm recency weighting *(180 ngày)*.
- [x] Giới hạn ảnh hưởng của một repo duy nhất *(cap = 1)*.
- [x] Normalize language bằng square-root weighting.

## Cache

- [x] Cache profile riêng *(TTL 24h)*.
- [x] Cache tech profile riêng *(repos TTL 12h)*.
- [x] Cache recent activity riêng *(events TTL 30m)*.
- [ ] Serve stale cache khi GitHub lỗi tạm thời *(events degrade về empty; chưa giữ snapshot cũ)*.
- [x] Không gọi GitHub bằng token từ browser.

Suggested TTL:

```txt
Profile:        24 hours   ✅
Tech profile:   12 hours   ✅
Daily state:    30 minutes ✅
Pet profile:    derived    ✅  (engine chạy sau mỗi lần collect)
```

---

# Phase 3 — Tech archetype system

## Initial archetypes

- [x] `interface`
- [x] `backend`
- [x] `systems`
- [x] `data`

Để sau:

- [ ] `mobile`
- [ ] `platform`

## Scoring

- [x] Mapping language → archetype.
- [x] Hỗ trợ mixed profile.
- [x] Tính primary, secondary và optional tertiary influence.
- [x] Trả confidence + evidence metadata.
- [x] Gọi đúng là **GitHub-visible stack**, không phải full tech stack của user.

## Stability

- [x] Tech window khoảng 180 ngày.
- [ ] Hysteresis để pet không đổi appearance liên tục *(chưa lưu state cũ giữa các lần sync)*.
- [x] Archetype phụ phải vượt margin mới hiện *(secondary ≥18%, tertiary ≥12%)*.
- [x] Version thuật toán fusion.

---

# Phase 4 — Deterministic pet identity

- [x] Stable hash từ normalized username *(FNV-1a)*.
- [x] Base species từ seed.
- [x] Body variant.
- [x] Face/eye variant.
- [x] Base palette.
- [x] Personality modifier nhỏ.
- [x] `identityVersion` trong output.

Initial species:

- [x] Cat
- [x] Fox
- [x] Rabbit

### Tests

- [ ] Cùng username + cùng version → cùng identity. *(đúng behavior, chưa có test tự động)*
- [ ] Username khác nhau → có variation hợp lý.
- [ ] Reload không reroll.
- [ ] Algorithm change phải explicit bằng version.

---

# Phase 5 — Trait-based fusion

Không vẽ một pet riêng cho từng combination công nghệ.

## Trait slots

- [x] Base body *(species pixel map)*.
- [x] Head/ears *(trong species sprite)*.
- [ ] Tail/body detail *(có trong sprite từng species, chưa là trait slot độc lập)*.
- [x] Outfit.
- [x] Handheld accessory.
- [x] Workstation.
- [x] Room decoration.
- [x] Visual effect.

## Influence rules

- [x] Primary archetype điều khiển outfit, workstation, room theme.
- [x] Secondary archetype điều khiển accessory.
- [x] Tertiary archetype điều khiển effect.
- [x] Giới hạn số influence hiển thị *(top 4 languages trên UI)*.
- [ ] Trait slot conflict rules *(chưa formal)*.
- [x] Fallback khi combination không tương thích *(archetype `unknown`)*.
- [x] Palette theo pet identity, không copy màu logo tech một cách máy móc.

## Versioning

- [x] `fusionVersion`.
- [x] `assetVersion`.
- [ ] Quy tắc migrate appearance cũ.

---

# Phase 6 — Daily state engine

## Initial actions

- [x] `idle`
- [x] `working`
- [x] `resting`
- [x] `celebrating`

## Initial moods

- [x] `calm`
- [x] `focused`
- [x] `happy`
- [x] `sleepy`
- [x] `waiting`

## Mapping

- [x] Không activity → nghỉ / idle *(không trừng phạt)*.
- [x] Light activity → idle / waiting.
- [x] Active day → focused working.
- [x] Intense day → focused hoặc happy working.
- [ ] PR/review → review-board animation *(chưa có animation riêng)*.
- [x] Release/milestone → special celebration.
- [x] Time of day chỉ đổi lighting.
- [x] Cùng data window → cùng state *(seed theo username + date + band)*.

## Anti-gamification

- [x] Không productivity score.
- [x] Không equate commit count với skill.
- [x] Không punish inactivity.
- [x] Không để một ngày spam commit ảnh hưởng lâu dài *(band theo tuần, không tích lũy vĩnh viễn)*.

---

# Phase 7 — Versioned PetProfile contract

- [x] Tạo Zod schema cho API response.
- [x] Có source metadata minh bạch.
- [x] Version identity, fusion và asset.

*Schema thực tế mở rộng thêm `faceVariant`, `personality`, `accessory`, `state.band`, stats PR/reviews so với interface gốc bên dưới.*

```ts
interface GitPetProfile {
  username: string;
  generatedAt: string;
  lastSyncedAt: string;

  source: {
    visibility: "public";
    label: "Based on public GitHub activity";
  };

  identity: {
    identityVersion: number;
    seed: string;
    species: string;
    bodyVariant: string;
    palette: string;
    // + name, faceVariant, personality
  };

  tech: {
    fusionVersion: number;
    primaryArchetype: string;
    secondaryArchetype?: string;
    tertiaryArchetype?: string;
    languages: Array<{
      name: string;
      weight: number;
    }>;
    confidence: number;
    // + evidence: { reposConsidered, windowDays }
  };

  appearance: {
    assetVersion: number;
    traits: string[];
    outfit: string;
    workstation: string;
    roomTheme: string;
    effect?: string;
    // + accessory?
  };

  state: {
    mood: string;
    action: string;
    lighting: "day" | "evening" | "night";
    // + band, activeDays, pullRequests, reviews
  };
}
```

---

# Phase 8 — Web scene

## V1 scope

- [x] Một room layout.
- [x] Một desk.
- [x] Một workstation anchor.
- [x] Ba base species.
- [x] Bốn actions.
- [x] Bốn tech archetypes.
- [x] Day/evening/night lighting.
- [x] Pixel-perfect nearest-neighbor scaling *(shape-rendering="crispEdges")*.
- [x] Responsive desktop/mobile framing.

## Rendering requirements

- [x] Layered sprite composition.
- [x] Consistent frame dimensions *(16×16 grid)*.
- [x] Consistent anchor points *(cơ bản)*.
- [x] Conflict resolution khi trait overlap *(outfit đặt dưới mặt pet)*.
- [x] Missing asset fallback *(unknown archetype)*.
- [x] Reduced-motion mode.
- [x] Accessible text summary ngoài canvas.

## Main page content

- [x] Username + GitHub profile link.
- [x] Pet name/generated name.
- [x] Mood/action hiện tại.
- [x] GitHub-visible archetype summary.
- [x] Last synced time.
- [x] Share URL.
- [x] Giải thích pet được tạo từ dữ liệu nào.

### Bonus (ngoài roadmap gốc)

- [x] `/api/card/:username` — SVG card có animation cho README embed.
- [x] Landing demo pet từ fixture *(không gọi GitHub)*.

---

# Phase 9 — Testing

## Unit tests

- [ ] Username hash.
- [ ] Identity generation.
- [ ] Language normalization.
- [ ] Archetype scoring.
- [ ] Hysteresis.
- [ ] Fusion trait resolver.
- [ ] Trait conflicts.
- [ ] Daily state resolver.
- [ ] Cache key generation.

## Fixtures

- [x] Demo fixture (`demoEngineInput` — mixed TS/Go/Python/Shell).
- [ ] Interface-heavy profile.
- [ ] Backend-heavy profile.
- [ ] Systems-heavy profile.
- [ ] Data-heavy profile.
- [ ] Mixed profile *(ngoài demo)*.
- [ ] New user ít repo.
- [ ] User không có public repo.
- [ ] User không có recent activity.
- [ ] Missing user.

## E2E

- [ ] Valid `/:username`.
- [ ] Invalid username.
- [ ] Pet stable qua reload.
- [ ] Stale cache state.
- [ ] Mobile layout.
- [ ] Reduced motion.
- [ ] Không token trong browser/network payload.

---

# Phase 10 — CI/CD and deployment

- [ ] CI: lint, typecheck, unit test, build.
- [ ] Playwright smoke test.
- [ ] Vercel project config. *(đã chọn platform)*
- [ ] Optional `GITHUB_TOKEN` secret ngoài repository.
- [ ] Production logging không lưu data dư thừa.
- [ ] Cache purge/version strategy.
- [ ] Custom domain sau khi mua.

Expected URL:

```txt
https://gitpet.com/:username
```

---

# Phase 11 — Documentation and launch

- [x] Architecture overview *(README)*.
- [x] GitHub data limitations *(README + UI copy)*.
- [x] Privacy/public-data boundary *(README + UI copy)*.
- [ ] High-level fusion rules *(chưa có doc riêng)*.
- [ ] Screenshots/video khi scene ổn định.
- [ ] GitHub repo description + topics.
- [ ] Live demo link.
- [ ] Launch post + demo video.
- [ ] Pin GitPet trên weTwenties khi V1 usable.

---

# Explicitly out of scope for V1

*Những mục này cố ý chưa làm — giữ nguyên checklist để theo dõi scope.*

- [ ] GitHub OAuth/login.
- [ ] Private repository analysis.
- [ ] Manual customization.
- [ ] Inventory/shop.
- [ ] Marketplace.
- [ ] Team/organization pet.
- [ ] Multiplayer.
- [ ] Mobile app.
- [ ] Runtime AI-generated sprites.
- [ ] Đọc arbitrary source files để detect framework.
- [ ] Skill score hoặc developer ranking.

---

# Recommended implementation order

```txt
01. Workspace foundation              [~]  Next.js + src/lib, chưa monorepo
02. Fixture-based PetProfile schema     [x]  Zod + demoEngineInput
03. Deterministic identity engine       [x]
04. Archetype scorer                    [x]
05. Trait-based fusion resolver         [x]
06. Daily state resolver                [x]
07. /:username route với fixture data   [x]  + GitHub thật
08. GitHub collector                    [x]
09. API + cache                         [x]  Next.js server (thay Worker)
10. Layered scene renderer              [x]  SVG (thay PixiJS)
11. CI + Playwright                     [ ]
12. Production deploy                   [ ]  Vercel
```

# V1 definition of done

```txt
User mở gitpet.com/:username
→ resolve public GitHub user              ✅
→ tạo stable base pet identity            ✅
→ fusion trait từ public technology profile ✅
→ chọn mood/action từ recent activity     ✅
→ render responsive animated scene        ✅
→ không expose GitHub credential          ✅
→ giải thích rõ dữ liệu chỉ dựa trên public GitHub-visible activity ✅
```

**Còn thiếu để gọi là V1 launch-ready:** automated tests, CI, production deploy, stale-cache UX, hysteresis archetype.
