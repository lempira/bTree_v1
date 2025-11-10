import SignUp from "../components/SignUp";
import DataCleaner from "../components/DataCleaner";
import DatabaseStatus from "../components/DatabaseStatus";

export default function Landing(): JSX.Element {
  return (
    <main style={{ padding: "2rem 0" }}>
      {/* Hero */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.75rem", lineHeight: 1.1, margin: 0 }}>
          Welcome to bTree
        </h1>
      </section>

      <section
        aria-label="Account onboarding"
        style={{
          display: "grid",
          gap: "1.5rem",
          marginBottom: "2.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        <SignUp />
        <DataCleaner />
      </section>

      <section aria-label="Database statistics">
        <DatabaseStatus />
      </section>
    </main>
  );
}
