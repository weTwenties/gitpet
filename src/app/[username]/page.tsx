import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  ARCHETYPE_LABELS,
  buildPetProfile,
  buildProfileDossier,
  type GitPetProfile,
} from "@/lib/pet-engine";
import { renderSceneSvg } from "@/lib/pet-renderer";
import {
  collectPetData,
  GitHubRateLimitedError,
  GitHubUserNotFoundError,
  isValidGitHubUsername,
  type GitHubPublicUser,
} from "@/lib/github/collector";
import CopyButton from "@/components/CopyButton";
import InteractiveHabitat from "@/components/InteractiveHabitat";
import UsernameForm from "@/components/UsernameForm";

type UserPetPageProps = {
  params: Promise<{ username: string }>;
};

function normalizeUsername(raw: string): string {
  return decodeURIComponent(raw).replace(/^@/, "").trim();
}

export async function generateMetadata({ params }: UserPetPageProps): Promise<Metadata> {
  const { username: raw } = await params;
  const username = normalizeUsername(raw);
  return {
    title: `@${username}'s GitPet`,
    description: `Meet the pixel companion born from @${username}'s public GitHub activity.`,
    alternates: { canonical: `/${username}` },
  };
}

async function siteOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function RateLimitedState({ username }: { username: string }) {
  return (
    <main className="pp-shell">
      <nav className="pp-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">G</span>
          <span>gitpet</span>
        </Link>
      </nav>
      <section className="pp-empty">
        <h1>GitHub is taking a nap</h1>
        <p>
          The public GitHub API rate limit was reached while summoning <strong>@{username}</strong>&apos;s pet.
          Please try again in a few minutes.
        </p>
        <Link className="pp-back" href="/">
          ← Back to home
        </Link>
      </section>
    </main>
  );
}

function ProfileContent({
  profile,
  user,
  origin,
}: {
  profile: GitPetProfile;
  user: GitHubPublicUser;
  origin: string;
}) {
  const dossier = buildProfileDossier(profile);
  const sceneSvg = renderSceneSvg(profile, { width: 720, height: 480 });
  const profileUrl = `${origin}/${profile.username}`;
  const cardUrl = `${origin}/api/card/${profile.username}`;
  const embedSnippet = `[![My GitPet](${cardUrl})](${profileUrl})`;
  const syncedTime = new Date(profile.lastSyncedAt).toUTCString();
  const secondary = profile.tech.secondaryArchetype;
  const tertiary = profile.tech.tertiaryArchetype;

  return (
    <main className="pp-shell">
      <nav className="pp-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">G</span>
          <span>gitpet</span>
        </Link>
        <div className="pp-nav-form">
          <UsernameForm buttonLabel="Summon" />
        </div>
      </nav>

      <header className="pp-masthead">
        <div className="pp-owner">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" width={48} height={48} />
          ) : (
            <span className="avatar-fallback">{profile.username.slice(0, 2).toUpperCase()}</span>
          )}
          <div>
            <a href={user.html_url} target="_blank" rel="noreferrer">
              @{profile.username} ↗
            </a>
            <small>{user.name ?? "GitHub explorer"}</small>
          </div>
        </div>

        <div className="pp-masthead-identity">
          <p className="pp-kicker">HABITAT DOSSIER</p>
          <h1 className="pp-name">{profile.identity.name}</h1>
          <p className="pp-tagline">
            {profile.identity.personality} {profile.identity.species} · {dossier.archetypeLabel}
          </p>
          <p className="pp-lede">{dossier.personalityBlurb}</p>
        </div>

        <aside className="pp-rank" aria-label={`Activity band: ${dossier.band.label}`}>
          <span className="pp-rank-label">WEEK</span>
          <strong className="pp-rank-value">{dossier.band.rank}</strong>
          <small>{dossier.band.label}</small>
        </aside>
      </header>

      <section className="pp-stage">
        <InteractiveHabitat
          svg={sceneSvg}
          label={`${profile.identity.name} habitat`}
          caption={`${profile.appearance.roomTheme.replace(/-/g, " ")} · ${profile.state.lighting} light · ${dossier.stateLine}`}
        />

        <div className="pp-dossier">
          <section className="pp-block">
            <h2 className="pp-block-title">Today&apos;s rhythm</h2>
            <p className="pp-block-lede">{dossier.band.blurb}</p>
            <ul className="pp-rhythm">
              <li>
                <span>Mood</span>
                <strong>{profile.state.mood}</strong>
                <em>{dossier.moodBlurb}</em>
              </li>
              <li>
                <span>Action</span>
                <strong>{profile.state.action}</strong>
                <em>{dossier.actionBlurb}</em>
              </li>
              <li>
                <span>Lighting</span>
                <strong>{profile.state.lighting}</strong>
                <em>Window tone shifts with the day&apos;s public pace.</em>
              </li>
            </ul>
          </section>

          <section className="pp-block">
            <h2 className="pp-block-title">Tech DNA</h2>
            <p className="pp-block-lede">{dossier.archetypeBlurb}</p>

            <div className="pp-archetypes">
              <div className="pp-archetype pp-archetype-primary">
                <span>Primary</span>
                <strong>{dossier.archetypeLabel}</strong>
              </div>
              {secondary ? (
                <div className="pp-archetype">
                  <span>Secondary</span>
                  <strong>{ARCHETYPE_LABELS[secondary]}</strong>
                </div>
              ) : null}
              {tertiary ? (
                <div className="pp-archetype">
                  <span>Tertiary</span>
                  <strong>{ARCHETYPE_LABELS[tertiary]}</strong>
                </div>
              ) : null}
            </div>

            <div className="pp-confidence" aria-label={`Fusion confidence ${dossier.confidencePct}%`}>
              <div className="pp-confidence-head">
                <span>Fusion confidence</span>
                <strong>{dossier.confidencePct}%</strong>
              </div>
              <div className="pp-confidence-track">
                <i style={{ width: `${dossier.confidencePct}%` }} />
              </div>
              <small>
                From {profile.tech.evidence.reposConsidered} repos · {profile.tech.evidence.windowDays}
                -day window
              </small>
            </div>

            {dossier.languages.length > 0 ? (
              <div className="pp-langs">
                <small>GITHUB-VISIBLE STACK</small>
                {dossier.languages.map((language) => (
                  <div className="pp-lang" key={language.name}>
                    <span>{language.name}</span>
                    <i style={{ width: `${language.pct}%` }} />
                    <b>{language.pct}%</b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="pp-empty-note">No dominant public language signal in the window.</p>
            )}
          </section>

          <section className="pp-block">
            <h2 className="pp-block-title">Habitat kit</h2>
            <p className="pp-block-lede">
              Fusion fills fixed slots from archetype mix — outfit, desk, and room stay aligned.
            </p>
            <dl className="pp-kit">
              {dossier.habitat.map((item) => (
                <div key={item.slot}>
                  <dt>{item.slot}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="pp-identity-bits">
              {dossier.identityBits.map((bit) => (
                <span key={bit.label} className="pp-bit">
                  <i>{bit.label}</i>
                  {bit.value}
                </span>
              ))}
            </div>
          </section>

          <section className="pp-block">
            <h2 className="pp-block-title">Care log</h2>
            <p className="pp-block-lede">Public activity that shaped this week&apos;s band — counts, not a vanity score.</p>
            <dl className="pp-care">
              {dossier.care.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                  <small>{metric.hint}</small>
                </div>
              ))}
            </dl>
          </section>

          <section className="pp-block pp-block-share">
            <h2 className="pp-block-title">Share</h2>
            <div className="pp-share-buttons">
              <CopyButton value={profileUrl} label="Copy profile link" />
              <CopyButton value={embedSnippet} label="Copy README embed" copiedLabel="Markdown copied!" />
            </div>
            <code className="pp-embed">{embedSnippet}</code>
            <footer className="pp-meta">
              <span>{profile.source.label}</span>
              <span>Last synced {syncedTime}</span>
            </footer>
          </section>
        </div>
      </section>

      <p className="pp-a11y">
        {profile.identity.name} is a {profile.identity.personality} pixel {profile.identity.species}. Today it is{" "}
        {profile.state.mood} and {profile.state.action}, reflecting @{profile.username}&apos;s recent public GitHub
        activity ({profile.state.band} week).
      </p>
    </main>
  );
}

export default async function UserPetPage({ params }: UserPetPageProps) {
  const { username: raw } = await params;
  const username = normalizeUsername(raw);
  if (!isValidGitHubUsername(username)) notFound();

  let data;
  try {
    data = await collectPetData(username);
  } catch (error) {
    if (error instanceof GitHubUserNotFoundError) notFound();
    if (error instanceof GitHubRateLimitedError) return <RateLimitedState username={username} />;
    throw error;
  }

  // Canonical URL: one casing per pet (github.com/FOO === github.com/foo).
  if (data.user.login !== username) redirect(`/${data.user.login}`);

  const profile = buildPetProfile(data.engineInput);
  const origin = await siteOrigin();

  return <ProfileContent profile={profile} user={data.user} origin={origin} />;
}
