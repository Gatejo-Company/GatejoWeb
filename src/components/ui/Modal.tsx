import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Prevent closing on backdrop click or Escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const preventDefault = (e: Event) => e.preventDefault();
    dialog.addEventListener('cancel', preventDefault);
    return () => dialog.removeEventListener('cancel', preventDefault);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`w-[calc(100%-2rem)] sm:w-full ${maxWidthClasses[maxWidth]} rounded-xl p-0 shadow-xl backdrop:bg-black/40 open:animate-none m-auto max-h-[90vh] overflow-y-auto`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
      <div className="px-4 sm:px-6 py-5">{children}</div>
    </dialog>
  );
}
