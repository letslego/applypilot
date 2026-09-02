"use client";

import { cn } from "@/lib/utils";

export function DocumentsSelect({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-teal-900/10 bg-white/90 px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
      >
        {children}
      </select>
    </label>
  );
}

export function SkillHeatmap({
  matched,
  missing,
}: {
  matched: string[];
  missing: string[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-medium text-ink">Matched keywords</div>
        <div className="flex flex-wrap gap-2">
          {matched.length === 0 ? (
            <span className="text-sm text-ink/45">No matches yet</span>
          ) : (
            matched.map((skill) => (
              <span
                key={`m-${skill}`}
                className="rounded-lg bg-teal-800/10 px-2.5 py-1 text-xs font-medium capitalize text-teal-900 ring-1 ring-teal-800/15"
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm font-medium text-ink">Missing keywords</div>
        <div className="flex flex-wrap gap-2">
          {missing.length === 0 ? (
            <span className="text-sm text-ink/45">No gaps — strong coverage</span>
          ) : (
            missing.map((skill) => (
              <span
                key={`x-${skill}`}
                className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-medium capitalize text-amber-950 ring-1 ring-amber-700/20"
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(matched.length + missing.length || 1, 12)}, minmax(0, 1fr))`,
        }}
        aria-hidden
      >
        {[...matched.map((s) => ({ s, ok: true })), ...missing.map((s) => ({ s, ok: false }))].map(
          ({ s, ok }) => (
            <div
              key={`${ok}-${s}`}
              title={s}
              className={cn(
                "h-3 rounded-sm transition",
                ok ? "bg-teal-700" : "bg-amber-400/80",
              )}
            />
          ),
        )}
      </div>
    </div>
  );
}
