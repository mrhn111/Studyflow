import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-on-surface-variant mb-6 text-sm leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 border border-outline-variant/40 bg-transparent text-on-surface-variant rounded-xl font-semibold text-sm hover:bg-surface-container-low transition-all duration-150"
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
            destructive
              ? 'bg-error/10 text-error hover:bg-error/20 border border-error/20'
              : 'bg-primary text-on-primary shadow-btn hover:shadow-btn-hover hover:opacity-95'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
