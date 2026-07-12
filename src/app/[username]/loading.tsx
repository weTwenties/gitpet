import Link from "next/link";

export default function LoadingPet() {
  return (
    <main className="pp-shell">
      <nav className="pp-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">G</span>
          <span>gitpet</span>
        </Link>
      </nav>
      <section className="pp-empty">
        <div className="pp-egg" aria-hidden />
        <h1>Hatching…</h1>
        <p>Reading public GitHub signals and summoning the pet.</p>
      </section>
    </main>
  );
}
