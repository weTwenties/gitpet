import Link from "next/link";
import { buildPetProfile, demoEngineInput } from "@/lib/pet-engine";
import { renderSceneSvg } from "@/lib/pet-renderer";
import UsernameForm from "@/components/UsernameForm";

const ARCHETYPE_LABELS: Record<string, string> = {
  interface: "Interface crafter",
  backend: "Backend keeper",
  systems: "Systems tinkerer",
  data: "Data stargazer",
  unknown: "New explorer",
};

export default function HomePage() {
  // Demo pet goes through the exact same engine + renderer as real profiles.
  const demoProfile = buildPetProfile(demoEngineInput());
  const demoSvg = renderSceneSvg(demoProfile, { width: 560, height: 400 });
  const archetypeLabel = ARCHETYPE_LABELS[demoProfile.tech.primaryArchetype] ?? "Explorer";

  return (
    <main>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="GitPet home">
          <span className="brand-mark">G</span>
          <span>gitpet</span>
        </Link>
        <div className="nav-links">
          <a href="#genome">Pet genome</a>
          <a href="#how">How it works</a>
          <span className="beta-pill"><i /> Public data only</span>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span>●</span> Your commits have been raising something</div>
          <h1>Every GitHub history deserves a <em>living mascot.</em></h1>
          <p className="hero-lede">
            GitPet turns public activity into a one-of-one pixel companion. Your username decides who it is,
            your GitHub-visible stack dresses it up, and recent activity decides what it&apos;s doing today.
          </p>

          <UsernameForm />
          <p className="form-note"><span>↳</span> Same username, same pet — every single time</p>

          <div className="trust-row">
            <span>No login</span><b>·</b><span>No private repositories</span><b>·</b><span>Explainable traits</span>
          </div>
        </div>

        <div className="habitat-card">
          <div className="card-topline">
            <div className="profile-mini">
              <span className="avatar-fallback">GP</span>
              <div><strong>demo pet</strong><small>fixture profile</small></div>
            </div>
            <span className="level-pill">{demoProfile.identity.species.toUpperCase()}</span>
          </div>

          <div className="habitat-scene habitat-scene-svg" dangerouslySetInnerHTML={{ __html: demoSvg }} />

          <div className="stat-strip">
            <div><strong>{demoProfile.identity.name}</strong><span>pet name</span></div>
            <div><strong>{archetypeLabel}</strong><span>archetype</span></div>
            <div><strong>{demoProfile.state.mood}</strong><span>mood</span></div>
            <div><strong>{demoProfile.state.action}</strong><span>action</span></div>
          </div>
        </div>
      </section>

      <section className="genome-section" id="genome">
        <div className="section-heading">
          <div><span className="section-kicker">THE PET GENOME</span><h2>Not random. Born from your patterns.</h2></div>
          <p>Every visible trait has a reason, so the pet becomes a readable portrait of how you build — never a productivity score.</p>
        </div>

        <div className="genome-layout">
          <div className="trait-list trait-list-wide">
            <article><span className="trait-icon body-icon">◆</span><div><small>IDENTITY · USERNAME</small><strong>Species, palette &amp; personality</strong><p>A stable hash of your username picks the base pet. Refreshing never rerolls it.</p></div></article>
            <article><span className="trait-icon ear-icon">⌁</span><div><small>OUTFIT · PRIMARY STACK</small><strong>{archetypeLabel}</strong><p>Your GitHub-visible languages map to an archetype that dresses the pet and its room.</p></div></article>
            <article><span className="trait-icon tail-icon">∞</span><div><small>ACCESSORY · SECONDARY STACK</small><strong>Fusion traits</strong><p>A meaningful second archetype adds a handheld accessory instead of replacing the pet.</p></div></article>
            <article><span className="trait-icon aura-icon">✦</span><div><small>MOOD · RECENT ACTIVITY</small><strong>{demoProfile.state.mood} · {demoProfile.state.action}</strong><p>Recent public activity picks today&apos;s mood and action. Quiet weeks mean rest, never punishment.</p></div></article>
          </div>
        </div>
      </section>

      <section className="evolution-section" id="how">
        <div className="evolution-copy">
          <span className="section-kicker">BUILT FOR YOUR README</span>
          <h2>Your profile changes.<br />Your companion follows.</h2>
          <p>
            Every pet lives at a stable URL and ships as an animated SVG card you can pin inside your
            GitHub profile README — no login, no setup.
          </p>
          <a href="#top">Summon your pet <span>↗</span></a>
        </div>
        <div className="evolution-path" aria-label="How GitPet works">
          <div className="path-line" />
          <article><span className="stage-dot active">01</span><div><small>VISIT</small><strong>gitpet.com/your-username</strong><p>Swap github.com for gitpet.com — that&apos;s the whole onboarding.</p></div></article>
          <article><span className="stage-dot active">02</span><div><small>GENERATE</small><strong>Deterministic pet</strong><p>Identity from your username, outfit from your stack, mood from recent activity.</p></div></article>
          <article><span className="stage-dot active">03</span><div><small>EMBED</small><strong>README card</strong><p>Copy one line of Markdown and your pet lives in your GitHub profile.</p></div></article>
        </div>
      </section>

      <footer>
        <div className="brand"><span className="brand-mark">G</span><span>gitpet</span></div>
        <p>Built from public GitHub signals. Your code stays yours.</p>
        <span>V0.2 · FIRST HATCH</span>
      </footer>
    </main>
  );
}
