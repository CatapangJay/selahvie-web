"use client";

import { useState, type DragEvent } from "react";

/** Drag-and-drop wiring for a file drop zone. Spread `handlers` on the target element. */
export function useDropTarget(onFiles: (files: File[]) => void, disabled = false) {
  const [dragging, setDragging] = useState(false);

  const handlers = {
    onDragOver: (e: DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    },
  };

  return { dragging, handlers };
}
