function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 px-8 py-12 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
