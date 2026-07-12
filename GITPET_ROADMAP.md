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

## Product principles

- [ ] Cùng username luôn tạo ra cùng base pet khi cùng algorithm version.
- [ ] Tech stack chỉ thay đổi trait, outfit, workstation, room và effect; không thay toàn bộ pet ngẫu nhiên.
- [ ] Daily activity thay đổi mood/action nhanh hơn appearance.
- [ ] Pet không chết và không trừng phạt user khi nghỉ.
- [ ] UI phải ghi rõ kết quả dựa trên **public GitHub-visible activity**.
- [ ] Refresh trang không được reroll pet.
- [ ] Mọi thuật toán generation đều deterministic và versioned.
- [ ] Không hiển thị progress bar kỹ năng, phần trăm thành thạo hay developer ranking.

---

# Phase 0 — Repository foundation

## Workspace

- [ ] Khởi tạo pnpm workspace.
- [ ] Bật TypeScript strict mode.
- [ ] Thêm ESLint + Prettier.
- [ ] Thêm Vitest.
- [ ] Thêm Playwright.
- [ ] Tạo root scripts: `dev`, `lint`, `typecheck`, `test`, `build`.
- [ ] Tạo `.env.example` không chứa credential thật.
- [ ] Viết README ngắn mô tả product, architecture và scope V1.

## Proposed structure

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

- [ ] Frontend: React + Vite + TypeScript.
- [ ] Routing: React Router.
- [ ] Scene renderer: PixiJS hoặc Canvas 2D.
- [ ] API: Cloudflare Worker.
- [ ] API framework: Hono hoặc TypeScript handler gọn.
- [ ] Validation: Zod.
- [ ] Cache: Cloudflare KV.
- [ ] Hosting: Cloudflare Pages + Workers.

---

# Phase 1 — Public route and application shell

- [ ] Implement route `/:username`.
- [ ] Normalize username casing an toàn.
- [ ] Loading state.
- [ ] User not found state.
- [ ] GitHub rate limit / unavailable state.
- [ ] Stale-cache state + `lastSyncedAt`.
- [ ] Canonical URL cho từng username.
- [ ] Responsive shell desktop/mobile.
- [ ] Share/copy-link action.

### Definition of done

```txt
/:username
→ resolve public GitHub user
→ return placeholder PetProfile
→ render ổn định
→ không expose GitHub credential
```

---

# Phase 2 — GitHub data collector

## Public profile

- [ ] Fetch GitHub user theo login.
- [ ] Chỉ đọc field public cần thiết.
- [ ] Handle renamed, suspended hoặc unavailable account.

## Contributions

- [ ] Fetch recent contribution activity.
- [ ] Normalize thành activity bands:
  - `none`
  - `light`
  - `active`
  - `intense`
- [ ] Loại GitPet automation activity nếu có thể.
- [ ] Không dùng raw commit count làm productivity score.

## Repositories and languages

- [ ] Fetch số lượng repo public có giới hạn.
- [ ] Bỏ fork mặc định.
- [ ] Bỏ archived repo.
- [ ] Bỏ chính repo GitPet.
- [ ] Thêm recency weighting.
- [ ] Giới hạn ảnh hưởng của một repo duy nhất.
- [ ] Normalize language bytes bằng log hoặc square-root weighting.

## Cache

- [ ] Cache profile riêng.
- [ ] Cache tech profile riêng.
- [ ] Cache recent activity riêng.
- [ ] Serve stale cache khi GitHub lỗi tạm thời.
- [ ] Không gọi GitHub bằng token từ browser.

Suggested TTL:

```txt
Profile:        24 hours
Tech profile:   12–24 hours
Daily state:    15–30 minutes
Pet profile:    15–30 minutes
```

---

# Phase 3 — Tech archetype system

## Initial archetypes

- [ ] `interface`
- [ ] `backend`
- [ ] `systems`
- [ ] `data`

Để sau:

- [ ] `mobile`
- [ ] `platform`

## Scoring

- [ ] Mapping language → archetype.
- [ ] Hỗ trợ mixed profile.
- [ ] Tính primary, secondary và optional tertiary influence.
- [ ] Trả confidence + evidence metadata.
- [ ] Gọi đúng là **GitHub-visible stack**, không phải full tech stack của user.

## Stability

- [ ] Tech window khoảng 180 ngày.
- [ ] Hysteresis để pet không đổi appearance liên tục.
- [ ] Archetype mới phải vượt margin đủ lớn mới thay primary.
- [ ] Version thuật toán fusion.

---

# Phase 4 — Deterministic pet identity

- [ ] Stable hash từ normalized username.
- [ ] Base species từ seed.
- [ ] Body variant.
- [ ] Face/eye variant.
- [ ] Base palette.
- [ ] Personality modifier nhỏ.
- [ ] `identityVersion` trong output.

Initial species:

- [ ] Cat
- [ ] Fox
- [ ] Rabbit

### Tests

- [ ] Cùng username + cùng version → cùng identity.
- [ ] Username khác nhau → có variation hợp lý.
- [ ] Reload không reroll.
- [ ] Algorithm change phải explicit bằng version.

---

# Phase 5 — Trait-based fusion

Không vẽ một pet riêng cho từng combination công nghệ.

## Trait slots

- [ ] Base body.
- [ ] Head/ears.
- [ ] Tail/body detail.
- [ ] Outfit.
- [ ] Handheld accessory.
- [ ] Workstation.
- [ ] Room decoration.
- [ ] Visual effect.

## Influence rules

- [ ] Primary archetype điều khiển outfit, workstation, room theme.
- [ ] Secondary archetype điều khiển một major trait.
- [ ] Tertiary archetype điều khiển một accessory/effect nhỏ.
- [ ] Giới hạn số influence hiển thị để pet vẫn dễ đọc.
- [ ] Trait slot conflict rules.
- [ ] Fallback khi combination không tương thích.
- [ ] Palette theo pet identity, không copy màu logo tech một cách máy móc.

## Versioning

- [ ] `fusionVersion`.
- [ ] `assetVersion`.
- [ ] Quy tắc migrate appearance cũ.

---

# Phase 6 — Daily state engine

## Initial actions

- [ ] `idle`
- [ ] `working`
- [ ] `resting`
- [ ] `celebrating`

## Initial moods

- [ ] `calm`
- [ ] `focused`
- [ ] `happy`
- [ ] `sleepy`
- [ ] `waiting`

## Mapping

- [ ] Không activity → nghỉ, đọc sách, đi dạo hoặc ngủ.
- [ ] Light activity → chuẩn bị bàn làm việc/check task.
- [ ] Active day → focused working.
- [ ] Intense day → stronger focus hoặc celebration.
- [ ] PR/review → review-board animation.
- [ ] Release/milestone → special celebration.
- [ ] Time of day chỉ đổi lighting.
- [ ] Cùng data window → cùng state.

## Anti-gamification

- [ ] Không productivity score.
- [ ] Không equate commit count với skill.
- [ ] Không punish inactivity.
- [ ] Không để một ngày spam commit ảnh hưởng lâu dài.

---

# Phase 7 — Versioned PetProfile contract

- [ ] Tạo Zod schema cho API response.
- [ ] Có source metadata minh bạch.
- [ ] Version identity, fusion và asset.

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
  };

  appearance: {
    assetVersion: number;
    traits: string[];
    outfit: string;
    workstation: string;
    roomTheme: string;
    effect?: string;
  };

  state: {
    mood: string;
    action: string;
    lighting: "day" | "evening" | "night";
  };
}
```

---

# Phase 8 — Web scene

## V1 scope

- [ ] Một room layout.
- [ ] Một desk.
- [ ] Một workstation anchor.
- [ ] Ba base species.
- [ ] Bốn actions.
- [ ] Bốn tech archetypes.
- [ ] Day/evening/night lighting.
- [ ] Pixel-perfect nearest-neighbor scaling.
- [ ] Responsive desktop/mobile framing.

## Rendering requirements

- [ ] Layered sprite composition.
- [ ] Consistent frame dimensions.
- [ ] Consistent anchor points.
- [ ] Conflict resolution khi trait overlap.
- [ ] Missing asset fallback.
- [ ] Reduced-motion mode.
- [ ] Accessible text summary ngoài canvas.

## Main page content

- [ ] Username + GitHub profile link.
- [ ] Pet name/generated name.
- [ ] Mood/action hiện tại.
- [ ] GitHub-visible archetype summary.
- [ ] Last synced time.
- [ ] Share URL.
- [ ] Giải thích pet được tạo từ dữ liệu nào.

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

- [ ] Interface-heavy profile.
- [ ] Backend-heavy profile.
- [ ] Systems-heavy profile.
- [ ] Data-heavy profile.
- [ ] Mixed profile.
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
- [ ] Cloudflare Pages config.
- [ ] Worker secrets ngoài repository.
- [ ] KV namespace bindings.
- [ ] Production logging không lưu data dư thừa.
- [ ] Cache purge/version strategy.
- [ ] Custom domain sau khi mua.

Expected URL:

```txt
https://gitpet.com/:username
```

---

# Phase 11 — Documentation and launch

- [ ] Architecture overview.
- [ ] GitHub data limitations.
- [ ] Privacy/public-data boundary.
- [ ] High-level fusion rules.
- [ ] Screenshots/video khi scene ổn định.
- [ ] GitHub repo description + topics.
- [ ] Live demo link.
- [ ] Launch post + demo video.
- [ ] Pin GitPet trên weTwenties khi V1 usable.

---

# Explicitly out of scope for V1

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
01. Workspace foundation
02. Fixture-based PetProfile schema
03. Deterministic identity engine
04. Archetype scorer
05. Trait-based fusion resolver
06. Daily state resolver
07. /:username route với fixture data
08. GitHub collector
09. Worker API + cache
10. Layered scene renderer
11. CI + Playwright
12. Production deploy
```

# V1 definition of done

```txt
User mở gitpet.com/:username
→ resolve public GitHub user
→ tạo stable base pet identity
→ fusion trait từ public technology profile
→ chọn mood/action từ recent activity
→ render responsive animated scene
→ không expose GitHub credential
→ giải thích rõ dữ liệu chỉ dựa trên public GitHub-visible activity
```