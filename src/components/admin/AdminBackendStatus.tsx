"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaPlug } from "react-icons/fa";

interface Status {
  ok: boolean;
  login: { info?: string };
  connection: { credsSet?: boolean; usesDefaultPassword?: boolean };
}

export default function AdminBackendStatus() {
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
        <FaPlug /> Checking live backend connection…
      </div>
    );
  }

  if (state.ok) {
    const usingDefault = !state.connection.credsSet || state.connection.usesDefaultPassword;
    return (
      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
        <FaCheckCircle className="mt-0.5 shrink-0" />
        <span>
          <b>Live backend connected</b> — edits will be saved to pespeshawar.pk.
          {state.login.info ? ` ${state.login.info}.` : ""}
          {usingDefault && (
            <span className="mt-1 block text-emerald-600">
              Using default credentials — set{" "}
              <code className="rounded bg-emerald-100 px-1">PES_ADMIN_USERNAME</code> /{" "}
              <code className="rounded bg-emerald-100 px-1">PES_ADMIN_PASSWORD</code> in{" "}
              <code className="rounded bg-emerald-100 px-1">.env.local</code>.
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
        <b>Backend write unavailable.</b>{" "}
        {state.login.info ?? "Could not reach the live API."} Copy{" "}
        <code className="rounded bg-amber-100 px-1">.env.example</code> to{" "}
        <code className="rounded bg-amber-100 px-1">.env.local</code> and set{" "}
        <code className="rounded bg-amber-100 px-1">PES_ADMIN_USERNAME</code> /{" "}
        <code className="rounded bg-amber-100 px-1">PES_ADMIN_PASSWORD</code>,
        then refresh.
      </span>
    </div>
  );
}
