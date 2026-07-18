"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { QuickAddSheet } from "@/components/quick-add/QuickAddSheet";
import styles from "./FloatingActionButton.module.css";

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={styles.button}
        type="button"
        aria-label="Agregar registro"
        onClick={() => setOpen(true)}
      >
        <Plus size={29} strokeWidth={2.6} />
      </button>

      <QuickAddSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
