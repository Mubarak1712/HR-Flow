function FormCard({ title, children, footer }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
      {title ? <h2 className="mb-5 text-lg font-semibold text-slate-900">{title}</h2> : null}
      <div className="space-y-4">{children}</div>
      {footer ? <div className="mt-6 border-t border-slate-200 pt-4">{footer}</div> : null}
    </div>
  );
}

export default FormCard;
