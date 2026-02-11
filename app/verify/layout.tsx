/**
 * Standalone verify layout: no dashboard sidebar or nav chrome.
 * Full viewport, dark neutral background, minimal typography for staff scanner use.
 */
export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100" style={{ minHeight: "100dvh" }}>
      {children}
    </div>
  );
}
