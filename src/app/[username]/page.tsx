import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  ARCHETYPE_LABELS,
  SPECIES_LABELS,
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
  const sceneSvg = renderSceneSvg(profile, { width: 1280, height: 800, cover: true });
  const profileUrl = `${origin}/${profile.username}`;
  const cardUrl = `${origin}/api/card/${profile.username}`;
  const embedSnippet = `[![My GitPet](${cardUrl})](${profileUrl})`;
  const syncedTime = new Date(profile.lastSyncedAt).toUTCString();
  const secondary = profile.tech.secondaryArchetype;
  const tertiary = profile.tech.tertiaryArchetype;

  return (
    <main className="pp-shell">
      <InteractiveHabitat svg={sceneSvg} label={`${profile.identity.name} habitat`} />

      <div className="pp-ui">
        <nav className="pp-nav">
          <Link className="brand" href="/">
            <span className="brand-mark">G</span>
            <span>gitpet</span>
          </Link>

          <div className="pp-owner">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" width={40} height={40} />
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
        </nav>

        <section className="pp-stage">
          <aside className="pp-rail pp-rail-left">
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
                  <em>Window tone follows the day&apos;s public pace.</em>
                </li>
              </ul>
            </section>

            {/* This week metrics temporarily hidden — public events undercount vs GitHub contribution graph (private + commit counts).
            <section className="pp-block">
              <h2 className="pp-block-title">This week</h2>
              <dl className="pp-care">
                {dossier.care.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.label}</dt>
                    <dd>{metric.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="pp-block-note">
                Public GitHub events in the activity window — raw counts that set this week&apos;s band.
              </p>
            </section>
            */}

            <section className="pp-block">
              <h2 className="pp-block-title">Identity</h2>
              <div className="pp-identity-bits">
                {dossier.identityBits.map((bit) => (
                  <span key={bit.label} className="pp-bit">
                    <i>{bit.label}</i>
                    {bit.value}
                  </span>
                ))}
              </div>
              <p className="pp-block-note">{dossier.personalityBlurb}</p>
            </section>
          </aside>

          <div className="pp-center">
            <div className="pp-center-head">
              <h1 className="pp-name">{profile.identity.name}</h1>
              <p className="pp-tagline">
                {profile.identity.personality} {SPECIES_LABELS[profile.identity.species]} ·{" "}
                {dossier.archetypeLabel}
              </p>
            </div>

            <div className="pp-center-spacer" aria-hidden="true" />

            <p className="pp-scene-caption">
              {profile.appearance.roomTheme.replace(/-/g, " ")} · {profile.state.lighting} light ·{" "}
              {dossier.stateLine}
            </p>
            <p className="pp-scene-hint">Move near the pet · click to poke</p>

            <div className="pp-share">
              <div className="pp-share-buttons">
                <CopyButton value={profileUrl} label="Copy profile link" />
                <CopyButton value={embedSnippet} label="Copy README embed" copiedLabel="Markdown copied!" />
              </div>
              <code className="pp-embed">{embedSnippet}</code>
              <p className="pp-meta">
                <span>{profile.source.label}</span>
                <span>Synced {syncedTime}</span>
              </p>
            </div>
          </div>

          <aside className="pp-rail pp-rail-right">
            <aside className="pp-rank" aria-label={`Activity band: ${dossier.band.label}`}>
              <span className="pp-rank-label">WEEK</span>
              <strong className="pp-rank-value">{dossier.band.rank}</strong>
              <small>{dossier.band.label}</small>
            </aside>

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
                  {profile.tech.evidence.reposConsidered} repos · {profile.tech.evidence.windowDays}d
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
                <p className="pp-empty-note">No dominant public language signal yet.</p>
              )}
            </section>

            <section className="pp-block">
              <h2 className="pp-block-title">Habitat kit</h2>
              <dl className="pp-kit">
                {dossier.habitat.map((item) => (
                  <div key={item.slot}>
                    <dt>{item.slot}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </aside>
        </section>

        <p className="pp-a11y">
          {profile.identity.name} is a {profile.identity.personality} pixel{" "}
          {SPECIES_LABELS[profile.identity.species]}. Today it is {profile.state.mood} and{" "}
          {profile.state.action}, reflecting @{profile.username}&apos;s recent public GitHub activity (
          {profile.state.band} week).
        </p>
      </div>
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
