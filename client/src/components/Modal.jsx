import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

function Modal({ isOpen, title, description, onClose, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_24px_90px_rgba(15,23,42,0.22)] sm:p-6"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>

          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Modal;
