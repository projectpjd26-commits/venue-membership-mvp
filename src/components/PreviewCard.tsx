/**
 * Realistic product preview card — Stripe/Supabase admin panel style.
 * No illustration; slate dashboard container with header, badge, table rows.
 */
export function PreviewCard() {
  return (
    <div className="bg-slate-900 text-slate-200 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <span className="font-semibold tracking-tight text-slate-100">COTERI</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700/80 text-slate-300 border border-slate-600">
          Active Venue
        </span>
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="pb-2 pr-4 font-medium">Member</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 font-medium">Last Verified</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            <tr className="border-b border-slate-800">
              <td className="py-2.5 pr-4">Member Name</td>
              <td className="py-2.5 pr-4">
                <span className="text-emerald-400/90">Active</span>
              </td>
              <td className="py-2.5">Today</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="py-2.5 pr-4">—</td>
              <td className="py-2.5 pr-4">—</td>
              <td className="py-2.5">—</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4">—</td>
              <td className="py-2.5 pr-4">—</td>
              <td className="py-2.5">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
