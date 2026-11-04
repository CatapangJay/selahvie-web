"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { needsSeat, seatsTaken } from "@/lib/seating";
import type { GuestListEntry, GuestSide, SeatingPlan, SeatingTable } from "@/types/wedding";
import FloorSurface from "./FloorSurface";
import type { PrintJob } from "./Toolbar";

interface Props {
  job: PrintJob;
  title: string;
  plan: SeatingPlan;
  byTable: Map<string, GuestListEntry[]>;
  seatable: GuestListEntry[];
  tableOf: (g: GuestListEntry) => SeatingTable | undefined;
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
  onDone: () => void;
}

/**
 * A print-only copy of the plan, portaled to <body>. While it's mounted, print
 * styles hide the rest of the app; it opens the print dialog once and unmounts
 * when the dialog closes.
 */
export default function SeatingPrint({ job, title, plan, byTable, seatable, tableOf, sideOf, onDone }: Props) {
  useEffect(() => {
    const done = () => onDone();
    window.addEventListener("afterprint", done);
    // Let the portal paint before the dialog snapshots the page.
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("afterprint", done);
    };
  }, [onDone]);

  const subtitle = { plan: "Floor plan", tables: "Table list", lookup: "Find your table" }[job.view];

  return createPortal(
    <div data-seating-print="" style={{ color: "#2F1E26", fontFamily: "var(--font-sans, system-ui)" }}>
      <style>{`
        @media screen { [data-seating-print] { display: none; } }
        @media print {
          body > *:not([data-seating-print]) { display: none !important; }
          body { background: #fff !important; }
          @page { margin: 12mm; }
          [data-seating-print] .avoid-break { break-inside: avoid; }
        }
      `}</style>
      <header style={{ borderBottom: "1px solid #DFD4D4", paddingBottom: "4mm", marginBottom: "6mm", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontSize: "20pt", fontWeight: 400 }}>{title}</h1>
        <p style={{ fontSize: "10pt", color: "#604C55" }}>{subtitle}</p>
      </header>

      {job.view === "plan" && (
        <>
          <div style={{ border: "1px solid #DFD4D4", borderRadius: 6 }}>
            <FloorSurface readOnly plan={plan} byTable={byTable} sideOf={sideOf} />
          </div>
          {job.names && <TableColumns plan={plan} byTable={byTable} style={{ marginTop: "8mm" }} />}
        </>
      )}

      {job.view === "tables" && <TableColumns plan={plan} byTable={byTable} />}

      {job.view === "lookup" && (
        <ol style={{ columns: 2, columnGap: "10mm", fontSize: "11pt", listStyle: "none", padding: 0 }}>
          {[...seatable]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((g) => {
              const t = tableOf(g);
              return (
                <li key={g.id} className="avoid-break" style={{ display: "flex", justifyContent: "space-between", gap: "4mm", padding: "1.6mm 0", borderBottom: "0.5px solid #DFD4D4" }}>
                  <span>{g.name}{g.partySize > 1 ? <span style={{ color: "#604C55" }}> · party of {g.partySize}</span> : null}</span>
                  <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{t ? t.name : "Not seated"}</span>
                </li>
              );
            })}
        </ol>
      )}
    </div>,
    document.body
  );
}

function TableColumns({ plan, byTable, style }: { plan: SeatingPlan; byTable: Map<string, GuestListEntry[]>; style?: React.CSSProperties }) {
  return (
    <div style={{ columns: 3, columnGap: "8mm", fontSize: "10pt", ...style }}>
      {plan.tables.map((t) => {
        const seated = (byTable.get(t.id) ?? []).filter(needsSeat);
        return (
          <section key={t.id} className="avoid-break" style={{ marginBottom: "5mm" }}>
            <h2 style={{ fontSize: "11pt", fontWeight: 600, borderBottom: "0.5px solid #DFD4D4", paddingBottom: "1mm", marginBottom: "1.5mm", display: "flex", justifyContent: "space-between" }}>
              <span>{t.name}{t.tag ? <span style={{ fontWeight: 400, color: "#604C55" }}> · {t.tag}</span> : null}</span>
              <span style={{ fontWeight: 400, color: "#604C55" }}>{seatsTaken(seated)}/{t.seats}</span>
            </h2>
            {seated.length === 0 ? (
              <p style={{ color: "#604C55" }}>No guests yet</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {seated.map((g) => (
                  <li key={g.id}>{g.name}{g.partySize > 1 ? ` (${g.partySize})` : ""}</li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
