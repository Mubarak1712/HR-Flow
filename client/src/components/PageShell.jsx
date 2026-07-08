import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function PageShell({ title, description, actions, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            <Sparkles size={14} />
            Premium workspace
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>

      {children}
    </motion.div>
  );
}

export default PageShell;
