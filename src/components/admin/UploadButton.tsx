"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FaSpinner, FaUpload } from "react-icons/fa";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

/**
 * Uploads an image to the live backend (/api/upload via /api/admin/upload)
 * and fills the field with the returned URL (relative /storage/images/...).
 */
export default function UploadButton({
  value,
  onChange,
  label = "Upload",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Upload failed");
      } else if (json.url) {
        onChange(json.url);
      } else {
        setError("Upload did not return a URL");
      }
    } catch {
      setError("Network error during upload");
    }
    setBusy(false);
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-800 disabled:opacity-60"
      >
        {busy ? <FaSpinner className="animate-spin" /> : <FaUpload />}
        {busy ? "Uploading…" : label}
      </button>
      {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
    </span>
  );
}
