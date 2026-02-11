/**
 * Root route — minimal sanity test so Vercel mounts something at /.
 * If this 404s, Vercel Root Directory is wrong (must be empty or ".").
 */
export default function Page() {
  return <h1>COTERI ROOT TEST</h1>;
}
