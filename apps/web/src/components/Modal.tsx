"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg" | "xl";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  dismissOnBackdrop?: boolean;
  hideCloseButton?: boolean;
  className?: string;
};

const sizeClassMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

export function Modal({
  open, onClose, title, children, footer,
  size = "md",
  dismissOnBackdrop = true,
  hideCloseButton = false,
  className = "",
}: ModalProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const el = boxRef.current;
    if (!el) return;
    const focusable = el.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    (focusable || el).focus();
  }, [open]);

  if (typeof window === "undefined" || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={() => dismissOnBackdrop && onClose?.()} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={boxRef} tabIndex={-1} className={["bg-white rounded-2xl shadow-lg w-full", sizeClassMap[size], "outline-none", className].join(" ")}>
          {(title || !hideCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">{title}</div>
              {!hideCloseButton && (
                <button onClick={onClose} className="px-2 py-1 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-teal-600/20" aria-label="بستن">✕</button>
              )}
            </div>
          )}
          <div className="p-4">{children}</div>
          {footer && <div className="p-4 border-t">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
}
