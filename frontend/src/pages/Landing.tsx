import React from "react";
import { Link } from "react-router-dom";
import SignUp from "../components/SignUp";
import DataCleaner from "../components/DataCleaner";

const secondaryActionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.6rem 1rem",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#f9fafb",
  color: "#111827",
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
};

export default function Landing(): JSX.Element {
  return (
    <main style={{ padding: "2rem 0" }}>
      {/* Hero */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.75rem", lineHeight: 1.1, margin: 0 }}>
          Welcome to bTree
        </h1>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <Link to="/about" style={secondaryActionStyle}>
            What is bTree?
          </Link>
        </div>
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
    </main>
  );
}
