import type { Metadata } from "next";
import GitPetExperience from "../components/GitPetExperience";

type UserPetPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: UserPetPageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username).replace(/^@/, "");

  return {
    title: `@${cleanUsername}'s GitPet`,
    description: `See the GitPet evolved from @${cleanUsername}'s public GitHub activity.`,
  };
}

export default async function UserPetPage({ params }: UserPetPageProps) {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username).replace(/^@/, "");

  return <GitPetExperience initialUsername={cleanUsername} autoLoad />;
}
