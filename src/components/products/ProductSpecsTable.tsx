interface ProductSpecsTableProps {
  specs: Record<string, string>;
  warranty?: string;
}

/**
 * Clean two-column technical specification table.
 */
export default function ProductSpecsTable({
  specs,
  warranty,
}: ProductSpecsTableProps) {
  const entries = Object.entries(specs);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-5 py-3.5 font-display text-xs font-bold uppercase tracking-[0.18em]">
              Specification
            </th>
            <th className="px-5 py-3.5 font-display text-xs font-bold uppercase tracking-[0.18em]">
              Detail
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value], idx) => (
            <tr
              key={key}
              className={
                idx % 2 === 0 ? "bg-white" : "bg-primary/[0.03]"
              }
            >
              <td className="border-t border-slate-100 px-5 py-3.5 font-semibold text-slate-600">
                {key}
              </td>
              <td className="border-t border-slate-100 px-5 py-3.5 text-slate-500">
                {value}
              </td>
            </tr>
          ))}
          {warranty && (
            <tr className="bg-accent/5">
              <td className="border-t border-slate-100 px-5 py-3.5 font-semibold text-primary">
                Warranty
              </td>
              <td className="border-t border-slate-100 px-5 py-3.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {warranty}
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
