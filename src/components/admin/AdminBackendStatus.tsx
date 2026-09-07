"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaDatabase, FaExclamationTriangle } from "react-icons/fa";

interface Status {
  ok: boolean;
  login?: { info?: string };
  connection?: { local?: boolean; productCount?: number; categoryCount?: number };
}

/** Banner showing the status of this site's own self-hosted store. */
export default function AdminBackendStatus({
  isOwner = true,
}: {
  /** Whether the signed-in account can see system/owner details. */
  isOwner?: boolean;
}) {
  const [state, setState] = useState<Status | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/status")
      .then((r) => r.json())
      .then((d) => active && setState(d as Status))
      .catch(() => active && setState(null));
    return () => {
      active = false;
    };
  }, []);

  if (!state) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-400">
        <FaDatabase /> Checking local store…
      </div>
    );
  }

  if (state.ok) {
    const count = state.connection?.productCount ?? 0;
    return (
      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
        <FaCheckCircle className="mt-0.5 shrink-0" />
        <span>
          <b>Self-hosted store active</b> — products, categories, settings and
          uploads are stored on this site.
          {state.login?.info ? ` ${state.login.info}.` : ""}
          {isOwner && (
            <span className="mt-1 block text-emerald-600">
              No external backend required. Seed or edit via{" "}
              <code className="rounded bg-emerald-100 px-1">Admin → Products</code>.
              {count === 0 && (
                <span className="ml-1 font-semibold text-amber-700">
                  Catalog is empty — run the migrate script or add products.
                </span>
              )}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
      <FaExclamationTriangle className="mt-0.5 shrink-0" />
      <span>
        <b>Store error.</b>{" "}
        {state.login?.info ?? "Could not read the local store."}
      </span>
    </div>
  );
}
