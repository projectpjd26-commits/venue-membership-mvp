/** Product preview for the hero section — floating panel with live table. */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Floating Panel */}
      <div className="relative bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition duration-700 hover:scale-[1.01]">
        {/* Subtle Edge Glow */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-indigo-500/20 pointer-events-none" aria-hidden />

        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <span className="font-medium text-slate-200 tracking-wide">COTERI</span>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            LIVE
          </span>
        </div>

        <div className="p-6 text-sm text-slate-300">
          <table className="w-full text-left">
            <thead className="text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="pb-3">Member</th>
                <th>Status</th>
                <th>Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-3">Alex Ramirez</td>
                <td className="text-green-400">Active</td>
                <td>Today</td>
              </tr>
              <tr>
                <td className="py-3">Jordan Lee</td>
                <td className="text-green-400">Active</td>
                <td>Today</td>
              </tr>
              <tr>
                <td className="py-3">Sam Patel</td>
                <td className="text-green-400">Active</td>
                <td>Today</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Drop Shadow Depth Layer */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" aria-hidden />
    </div>
  );
}
