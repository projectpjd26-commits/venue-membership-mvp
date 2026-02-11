/**
 * Diagnostic route: if https://coteri.vercel.app/test returns this page,
 * routing works and the 404 is likely root-only. If /test also 404s, build/output or project link is wrong.
 */
export default function TestPage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Test route works</h1>
      <p>If you see this, the app is building and serving routes. Root / may need a separate fix.</p>
    </div>
  );
}
