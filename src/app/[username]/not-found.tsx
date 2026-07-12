import Link from "next/link";
import UsernameForm from "@/components/UsernameForm";

export default function PetNotFound() {
  return (
    <main className="pp-shell">
      <nav className="pp-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">G</span>
          <span>gitpet</span>
        </Link>
      </nav>
      <section className="pp-empty">
        <h1>No pet lives here</h1>
        <p>That public GitHub profile couldn&apos;t be found. Try another username.</p>
        <div className="pp-empty-form">
          <UsernameForm buttonLabel="Summon" />
        </div>
        <Link className="pp-back" href="/">← Back to home</Link>
      </section>
    </main>
  );
}
