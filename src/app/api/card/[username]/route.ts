import { buildPetProfile } from "@/lib/pet-engine";
import { renderCardSvg } from "@/lib/pet-renderer";
import {
  collectPetData,
  GitHubRateLimitedError,
  GitHubUserNotFoundError,
  isValidGitHubUsername,
} from "@/lib/github/collector";

/**
 * SVG card for README embeds:
 *   ![GitPet](https://<host>/api/card/<username>)
 * GitHub proxies images through camo and honors Cache-Control, so together
 * with the data-cache TTLs this stays well inside unauthenticated rate limits.
 */

type RouteContext = { params: Promise<{ username: string }> };

function svgResponse(svg: string, maxAgeSeconds: number): Response {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds}`,
    },
  });
}

function messageCard(title: string, subtitle: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="180" viewBox="0 0 420 180" font-family="'Segoe UI', Ubuntu, Helvetica, Arial, sans-serif">
  <rect width="420" height="180" rx="12" fill="#0c1913"/>
  <rect x="0.5" y="0.5" width="419" height="179" rx="12" fill="none" stroke="#20352a"/>
  <text x="210" y="86" text-anchor="middle" font-size="15" font-weight="700" fill="#f5f7f2">${title}</text>
  <text x="210" y="110" text-anchor="middle" font-size="11" fill="#9aa79e">${subtitle}</text>
</svg>`;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { username: rawUsername } = await context.params;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "").replace(/\.svg$/i, "");

  if (!isValidGitHubUsername(username)) {
    return svgResponse(messageCard("Invalid username", "GitHub usernames are alphanumeric with hyphens"), 3600);
  }

  try {
    const { engineInput } = await collectPetData(username);
    const profile = buildPetProfile(engineInput);
    const { svg } = renderCardSvg(profile);
    return svgResponse(svg, 1800);
  } catch (error) {
    if (error instanceof GitHubUserNotFoundError) {
      return svgResponse(messageCard("Pet not found", `No public GitHub user “${username}”`), 3600);
    }
    if (error instanceof GitHubRateLimitedError) {
      return svgResponse(messageCard("Taking a nap", "GitHub rate limit reached — try again soon"), 300);
    }
    return svgResponse(messageCard("Something went wrong", "GitPet couldn't reach GitHub right now"), 300);
  }
}
