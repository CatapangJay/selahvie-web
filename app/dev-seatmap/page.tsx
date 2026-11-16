"use client";
// TEMPORARY local preview for checking the seat map visually. Delete after use.
import SeatMap from "@/components/seat-finder/SeatMap";
import { findRoute } from "@/components/seat-finder/wayfinding";
import type { FinderFloor } from "@/lib/seatFinder";

const round = (id: string, x: number, y: number) => ({ id, name: `Table ${id.slice(1)}`, shape: "round" as const, seats: 8, x, y });
const floor: FinderFloor = {
  room: { w: 100, h: 62.5 },
  tables: [round("t1", 14, 30), round("t2", 34, 30), round("t3", 66, 30), round("t4", 86, 30), round("t5", 14, 70), round("t6", 34, 80)],
  elements: [
    { id: "stage", kind: "stage", label: "Stage", shape: "rect", x: 50, y: 7, w: 34, h: 6 },
    { id: "dance", kind: "danceFloor", label: "Dance floor", shape: "rect", x: 55, y: 58, w: 22, h: 12 },
    { id: "south", kind: "entrance", label: "Main entrance", shape: "rect", x: 82, y: 96, w: 10, h: 2.5 },
    { id: "east", kind: "entrance", label: "Garden door", shape: "rect", x: 98, y: 60, w: 9, h: 2.5, rotation: 90 },
  ],
};

export default function Page() {
  return (
    <main style={{ padding: 16, display: "grid", gap: 24, background: "#FAF1F1" }}>
      {(["south", "east"] as const).map((id) => {
        const entrance = floor.elements.find((e) => e.id === id)!;
        const route = findRoute(floor, entrance, "t1");
        return (
          <div key={id} data-case={id} style={{ width: 360, background: "#FAF1F1" }}>
            <SeatMap floor={floor} targetId="t1" route={route} entrance={entrance} accent="#A75463" focus replayKey={0} />
          </div>
        );
      })}
    </main>
  );
}
