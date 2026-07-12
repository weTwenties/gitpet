import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { buildPetProfile, type GitPetProfile } from "@/lib/pet-engine";
import { renderSceneSvg } from "@/lib/pet-renderer";
import {
  collectPetData,
  GitHubRateLimitedError,
  GitHubUserNotFoundError,
  isValidGitHubUsername,
  type GitHubPublicUser,
} from "@/lib/github/collector";
import CopyButton from "@/components/CopyButton";
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

const ARCHETYPE_LABELS: Record<string, string> = {
  interface: "Interface crafter",
  backend: "Backend keeper",
  systems: "Systems tinkerer",
  data: "Data stargazer",
  unknown: "New explorer",
};

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
        <Link className="pp-back" href="/">← Back to home</Link>
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
  const sceneSvg = renderSceneSvg(profile, { width: 640, height: 440 });
  const profileUrl = `${origin}/${profile.username}`;
  const cardUrl = `${origin}/api/card/${profile.username}`;
  const embedSnippet = `[![My GitPet](${cardUrl})](${profileUrl})`;
  const archetypeLabel = ARCHETYPE_LABELS[profile.tech.primaryArchetype] ?? "Explorer";
  const syncedTime = new Date(profile.lastSyncedAt).toUTCString();

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

      <section className="pp-stage">
        <div
          className="pp-scene"
          // Renderer output is generated from validated data, never user-supplied markup.
          dangerouslySetInnerHTML={{ __html: sceneSvg }}
        />

        <aside className="pp-panel">
          <header className="pp-owner">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" width={44} height={44} />
            ) : (
              <span className="avatar-fallback">{profile.username.slice(0, 2).toUpperCase()}</span>
            )}
            <div>
              <a href={user.html_url} target="_blank" rel="noreferrer">
                @{profile.username} ↗
              </a>
              <small>{user.name ?? "GitHub explorer"}</small>
            </div>
          </header>

          <h1 className="pp-name">{profile.identity.name}</h1>
          <p className="pp-lineage">
            {profile.identity.personality} {profile.identity.species} · {archetypeLabel}
          </p>

          <div className="pp-chips">
            <span className="pp-chip">{profile.state.mood}</span>
            <span className="pp-chip">{profile.state.action}</span>
            <span className="pp-chip">{profile.state.lighting}</span>
          </div>

          {profile.tech.languages.length > 0 && (
            <div className="pp-langs">
              <small>GITHUB-VISIBLE STACK</small>
              {profile.tech.languages.slice(0, 4).map((language) => (
                <div className="pp-lang" key={language.name}>
                  <span>{language.name}</span>
                  <i style={{ width: `${Math.max(6, Math.round(language.weight * 100))}%` }} />
                </div>
              ))}
            </div>
          )}

          <dl className="pp-stats">
            <div>
              <dt>Active days</dt>
              <dd>{profile.state.activeDays}</dd>
            </div>
            <div>
              <dt>Pull requests</dt>
              <dd>{profile.state.pullRequests}</dd>
            </div>
            <div>
              <dt>Reviews</dt>
              <dd>{profile.state.reviews}</dd>
            </div>
          </dl>

          <div className="pp-share">
            <small>SHARE</small>
            <div className="pp-share-buttons">
              <CopyButton value={profileUrl} label="Copy profile link" />
              <CopyButton value={embedSnippet} label="Copy README embed" copiedLabel="Markdown copied!" />
            </div>
            <code className="pp-embed">{embedSnippet}</code>
          </div>

          <footer className="pp-meta">
            <span>{profile.source.label}</span>
            <span>Last synced {syncedTime}</span>
          </footer>
        </aside>
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
