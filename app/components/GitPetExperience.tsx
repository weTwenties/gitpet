"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
};

type GitHubEvent = {
  type: string;
  created_at: string;
  payload?: { commits?: unknown[] };
};

type GitHubRepo = {
  language: string | null;
  stargazers_count: number;
  fork: boolean;
};

type PetProfile = {
  level: number;
  stage: string;
  title: string;
  language: string;
  commits: number;
  pullRequests: number;
  activeDays: number;
  stars: number;
  xp: number;
  nextLevel: number;
  bodyClass: string;
  earClass: string;
  tailClass: string;
  auraClass: string;
};

const demoUser: GitHubUser = {
  login: "khanhvinhnguyen",
  name: "Vinh Nguyen",
  avatar_url: "",
  bio: "Frontend-focused full-stack developer building playful web products.",
  public_repos: 28,
  followers: 42,
  html_url: "https://github.com/khanhvinhnguyen",
};

const demoPet: PetProfile = {
  level: 24,
  stage: "Ranger",
  title: "TypeScript Nightfox",
  language: "TypeScript",
  commits: 148,
  pullRequests: 18,
  activeDays: 37,
  stars: 64,
  xp: 72,
  nextLevel: 25,
  bodyClass: "type-ts",
  earClass: "ears-tall",
  tailClass: "tail-fusion",
  auraClass: "aura-steady",
};

const languageClass: Record<string, string> = {
  TypeScript: "type-ts",
  JavaScript: "type-js",
  Python: "type-python",
  Go: "type-go",
  Rust: "type-rust",
  PHP: "type-php",
  Java: "type-java",
};

const languageCreature: Record<string, string> = {
  TypeScript: "Nightfox",
  JavaScript: "Sparkfox",
  Python: "Moonsnake",
  Go: "Cloudotter",
  Rust: "Ironcrab",
  PHP: "Pixelphant",
  Java: "Emberowl",
};

function buildPet(events: GitHubEvent[], repos: GitHubRepo[]): PetProfile {
  const commits = events.reduce(
    (total, event) => total + (event.type === "PushEvent" ? event.payload?.commits?.length ?? 1 : 0),
    0,
  );
  const pullRequests = events.filter((event) => event.type === "PullRequestEvent").length;
  const reviews = events.filter((event) => event.type === "PullRequestReviewEvent").length;
  const activeDays = new Set(events.map((event) => event.created_at.slice(0, 10))).size;
  const stars = repos.reduce((total, repo) => total + repo.stargazers_count, 0);

  const languages = repos.reduce<Record<string, number>>((totals, repo) => {
    if (!repo.fork && repo.language) totals[repo.language] = (totals[repo.language] ?? 0) + 1;
    return totals;
  }, {});
  const language = Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "TypeScript";

  const score = commits + pullRequests * 5 + reviews * 4 + activeDays * 3 + Math.min(stars, 100);
  const level = Math.max(1, Math.min(99, Math.floor(score / 12) + 1));
  const stage = level < 5 ? "Hatchling" : level < 15 ? "Scout" : level < 30 ? "Ranger" : "Guardian";
  const xp = score % 100;

  return {
    level,
    stage,
    title: `${language} ${languageCreature[language] ?? "Codekin"}`,
    language,
    commits,
    pullRequests,
    activeDays,
    stars,
    xp,
    nextLevel: level + 1,
    bodyClass: languageClass[language] ?? "type-default",
    earClass: commits > 70 ? "ears-tall" : "ears-soft",
    tailClass: pullRequests + reviews > 8 ? "tail-fusion" : "tail-simple",
    auraClass: activeDays > 18 ? "aura-steady" : "aura-calm",
  };
}

function Pet({ profile }: { profile: PetProfile }) {
  return (
    <div
      className={`pixel-pet ${profile.bodyClass} ${profile.earClass} ${profile.tailClass} ${profile.auraClass}`}
      aria-label={`${profile.title}, level ${profile.level}`}
      role="img"
    >
      <span className="pet-aura" />
      <span className="pet-tail tail-one" />
      <span className="pet-tail tail-two" />
      <span className="pet-body" />
      <span className="pet-ear ear-left" />
      <span className="pet-ear ear-right" />
      <span className="pet-face" />
      <span className="pet-eye eye-left" />
      <span className="pet-eye eye-right" />
      <span className="pet-nose" />
      <span className="pet-chest" />
      <span className="pet-paw paw-left" />
      <span className="pet-paw paw-right" />
      <span className="pet-spark spark-one" />
      <span className="pet-spark spark-two" />
      <span className="pet-spark spark-three" />
    </div>
  );
}

function ContributionGrid({ seed }: { seed: number }) {
  const cells = useMemo(
    () =>
      Array.from({ length: 84 }, (_, index) => {
        const n = (index * 17 + seed * 11 + (index % 7) * 5) % 13;
        return n < 4 ? 0 : n < 7 ? 1 : n < 10 ? 2 : n < 12 ? 3 : 4;
      }),
    [seed],
  );

  return (
    <div className="contribution-grid" aria-label="Stylized recent activity map">
      {cells.map((level, index) => (
        <span key={index} className={`contribution-cell contribution-${level}`} />
      ))}
    </div>
  );
}

type GitPetExperienceProps = {
  initialUsername?: string;
  autoLoad?: boolean;
};

export default function GitPetExperience({
  initialUsername = "khanhvinhnguyen",
  autoLoad = false,
}: GitPetExperienceProps) {
  const router = useRouter();
  const autoLoaded = useRef(false);
  const [username, setUsername] = useState(initialUsername);
  const [user, setUser] = useState<GitHubUser>(demoUser);
  const [pet, setPet] = useState<PetProfile>(demoPet);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    autoLoad ? "Loading this public GitHub profile…" : "Demo profile — search any public GitHub username",
  );

  const loadPet = useCallback(async (rawUsername: string) => {
    const cleanUsername = rawUsername.trim().replace(/^@/, "");
    if (!cleanUsername) return;

    setLoading(true);
    setMessage("Reading public activity signals…");
    try {
      const [userResponse, eventsResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`),
        fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/events/public?per_page=100`),
        fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=pushed`),
      ]);

      if (!userResponse.ok) throw new Error("User not found");
      const nextUser = (await userResponse.json()) as GitHubUser;
      const nextEvents = eventsResponse.ok ? ((await eventsResponse.json()) as GitHubEvent[]) : [];
      const nextRepos = reposResponse.ok ? ((await reposResponse.json()) as GitHubRepo[]) : [];

      setUser(nextUser);
      setPet(buildPet(nextEvents, nextRepos));
      setMessage("Built from public events and repository metadata");
    } catch {
      setMessage("Couldn’t find that public profile. Try another username.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad && initialUsername && !autoLoaded.current) {
      autoLoaded.current = true;
      void loadPet(initialUsername);
    }
  }, [autoLoad, initialUsername, loadPet]);

  function summonPet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, "");
    if (!cleanUsername) return;
    router.push(`/${encodeURIComponent(cleanUsername)}`);
    void loadPet(cleanUsername);
  }

  return (
    <main>
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="GitPet home">
          <span className="brand-mark">G</span>
          <span>gitpet</span>
        </a>
        <div className="nav-links">
          <a href="#genome">Pet genome</a>
          <a href="#evolution">Evolution</a>
          <span className="beta-pill"><i /> Public data only</span>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span>●</span> Your commits have been raising something</div>
          <h1>Every GitHub history deserves a <em>living mascot.</em></h1>
          <p className="hero-lede">
            GitPet turns public activity into a one-of-one companion. Languages shape its species,
            commits sharpen its traits, and collaboration unlocks rare fusions.
          </p>

          <form className="summon-form" onSubmit={summonPet}>
            <label htmlFor="github-username">github.com/</label>
            <input
              id="github-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="username"
              spellCheck={false}
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>{loading ? "Summoning…" : "Summon my pet"}</button>
          </form>
          <p className="form-note"><span>↳</span> {message}</p>

          <div className="trust-row">
            <span>No login</span><b>·</b><span>No private repositories</span><b>·</b><span>Explainable traits</span>
          </div>
        </div>

        <div className="habitat-card">
          <div className="card-topline">
            <div className="profile-mini">
              {user.avatar_url ? <img src={user.avatar_url} alt="" /> : <span className="avatar-fallback">VN</span>}
              <div><strong>@{user.login}</strong><small>{user.name ?? "GitHub explorer"}</small></div>
            </div>
            <span className="level-pill">LV. {pet.level}</span>
          </div>

          <div className="habitat-scene">
            <div className="moon" />
            <div className="cloud cloud-one" />
            <div className="cloud cloud-two" />
            <div className="pixel-tree tree-one"><i /><b /></div>
            <div className="pixel-tree tree-two"><i /><b /></div>
            <div className="island"><span /><b /></div>
            <Pet profile={pet} />
            <div className="pet-nameplate">
              <small>{pet.stage} · {pet.language} lineage</small>
              <strong>{pet.title}</strong>
            </div>
          </div>

          <div className="xp-block">
            <div className="xp-copy"><span>Evolution progress</span><strong>{pet.xp}% to level {pet.nextLevel}</strong></div>
            <div className="xp-track"><span style={{ width: `${Math.max(8, pet.xp)}%` }} /></div>
          </div>

          <div className="stat-strip">
            <div><strong>{pet.commits}</strong><span>recent commits</span></div>
            <div><strong>{pet.pullRequests}</strong><span>pull requests</span></div>
            <div><strong>{pet.activeDays}</strong><span>active days</span></div>
            <div><strong>{pet.stars}</strong><span>repo stars</span></div>
          </div>
        </div>
      </section>

      <section className="genome-section" id="genome">
        <div className="section-heading">
          <div><span className="section-kicker">THE PET GENOME</span><h2>Not random. Born from your patterns.</h2></div>
          <p>Every visible trait has a reason, so the pet becomes a readable portrait of how you build.</p>
        </div>

        <div className="genome-layout">
          <div className="activity-card">
            <div className="activity-head"><div><strong>Recent activity habitat</strong><span>12 weeks · public events</span></div><span className="live-dot">LIVE</span></div>
            <ContributionGrid seed={user.login.length + pet.level} />
            <div className="activity-legend"><span>Quiet</span><i className="contribution-0" /><i className="contribution-1" /><i className="contribution-2" /><i className="contribution-3" /><i className="contribution-4" /><span>Wild</span></div>
          </div>

          <div className="trait-list">
            <article><span className="trait-icon body-icon">◆</span><div><small>BODY · TOP LANGUAGE</small><strong>{pet.language} lineage</strong><p>Your most-used public repository language chooses the base species and palette.</p></div></article>
            <article><span className="trait-icon ear-icon">⌁</span><div><small>EARS · BUILD OUTPUT</small><strong>{pet.commits > 70 ? "Signal seekers" : "Soft listeners"}</strong><p>More recent commits create sharper, more alert features.</p></div></article>
            <article><span className="trait-icon tail-icon">∞</span><div><small>TAIL · COLLABORATION</small><strong>{pet.tailClass === "tail-fusion" ? "Fusion tail unlocked" : "Solo tail"}</strong><p>Pull requests and reviews unlock secondary traits from other lineages.</p></div></article>
            <article><span className="trait-icon aura-icon">✦</span><div><small>AURA · CONSISTENCY</small><strong>{pet.activeDays > 18 ? "Steady glow" : "Resting glow"}</strong><p>Active days strengthen the habitat aura without rewarding noisy commit spam.</p></div></article>
          </div>
        </div>
      </section>

      <section className="evolution-section" id="evolution">
        <div className="evolution-copy">
          <span className="section-kicker">BUILT FOR RETURN VISITS</span>
          <h2>Your profile changes.<br />Your companion remembers.</h2>
          <p>V1 focuses on a shareable snapshot. The system is already shaped for persistent pets, seasonal habitats, team fusion and collectible accessories.</p>
          <a href="#top">Try another GitHub profile <span>↗</span></a>
        </div>
        <div className="evolution-path" aria-label="Pet evolution stages">
          <div className="path-line" />
          <article><span className="stage-dot active">01</span><div><small>LEVEL 1–4</small><strong>Hatchling</strong><p>Identity forms from language signals.</p></div></article>
          <article><span className="stage-dot active">02</span><div><small>LEVEL 5–14</small><strong>Scout</strong><p>Commit traits and first aura appear.</p></div></article>
          <article><span className="stage-dot active">03</span><div><small>LEVEL 15–29</small><strong>Ranger</strong><p>Collaboration unlocks fusion anatomy.</p></div></article>
          <article><span className="stage-dot">04</span><div><small>LEVEL 30+</small><strong>Guardian</strong><p>Rare habitats and team relics emerge.</p></div></article>
        </div>
      </section>

      <footer><div className="brand"><span className="brand-mark">G</span><span>gitpet</span></div><p>Built from public GitHub signals. Your code stays yours.</p><span>V0.1 · FIRST HATCH</span></footer>
    </main>
  );
}
