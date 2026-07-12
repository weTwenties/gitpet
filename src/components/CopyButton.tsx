"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label: string;
  copiedLabel?: string;
};

export default function CopyButton({ value, label, copiedLabel = "Copied!" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable (http, permissions) — button simply stays unchanged.
    }
  }

  return (
    <button type="button" className="copy-button" onClick={copy}>
      {copied ? copiedLabel : label}
    </button>
  );
}
