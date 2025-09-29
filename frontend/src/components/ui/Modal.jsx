import React from "react";
import { Button } from "./button"; // your existing Button component

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div className="mb-4">{children}</div>
        {footer ? (
          <div className="flex justify-end space-x-2">{footer}</div>
        ) : (
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  );
}
