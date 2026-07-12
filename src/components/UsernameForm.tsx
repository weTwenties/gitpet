"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UsernameFormProps = {
  initialUsername?: string;
  buttonLabel?: string;
};

/** Search box: navigation only — all GitHub data is fetched on the server. */
export default function UsernameForm({
  initialUsername = "",
  buttonLabel = "Summon my pet",
}: UsernameFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [navigating, setNavigating] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = username.trim().replace(/^@/, "");
    if (!clean) return;
    setNavigating(true);
    router.push(`/${encodeURIComponent(clean)}`);
  }

  return (
    <form className="summon-form" onSubmit={submit}>
      <label htmlFor="github-username">github.com/</label>
      <input
        id="github-username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="username"
        spellCheck={false}
        autoComplete="off"
      />
      <button type="submit" disabled={navigating}>
        {navigating ? "Summoning…" : buttonLabel}
      </button>
    </form>
  );
}
