const variants = {
  default: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  info: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
};

function StatusBadge({ children, tone = "default" }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${variants[tone] || variants.default}`}>{children}</span>;
}

export default StatusBadge;
