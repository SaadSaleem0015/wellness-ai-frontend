import { useState, useEffect } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { notyf } from "../Helpers/notyf";

const SLOT_START = 9 * 60; // 9:00 in minutes
const SLOT_END = 17 * 60; // 17:00 in minutes (5pm)
const SLOT_STEP = 15; // Back to 15 minutes

const DAY_OPTIONS = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "In 2 days", offset: 2 },
  { label: "In 3 days", offset: 3 },
  { label: "In 4 days", offset: 4 },
  { label: "In 5 days", offset: 5 },
];

function pad(num: number) { return num.toString().padStart(2, "0"); }

function to24h(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`; // HH:MM
}

function formatTime(mins: number): string {
  const hour = Math.floor(mins / 60);
  const minute = mins % 60;
  const ampm = hour < 12 ? "am" : "pm";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${minute === 0 ? "00" : minute}${ampm}`;
}

function addDays(base: Date, add: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + add);
  return d;
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`;
}

export function EventsAvailability() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  // Keep "canceled" per slot for every day index (0..n): { [dayIdx]: Set<slotNumber> }
  const [canceled, setCanceled] = useState<Record<number, Set<number>>>({});
  const [loadingDay, setLoadingDay] = useState(false);

  // Precompute slots
  const slots: number[] = [];
  for (let min = SLOT_START; min < SLOT_END; min += SLOT_STEP) {
    slots.push(min);
  }

  const today = new Date();
  const selectedDate = addDays(today, DAY_OPTIONS[selectedDayIdx].offset);
  const dateLabel = selectedDate.toLocaleDateString(undefined, { 
    weekday: "short", 
    month: "short", 
    day: "numeric" 
  });
  const selectedYMD = toYMD(selectedDate);

  const dayKey = selectedDayIdx;
  const canceledSet = canceled[dayKey] || new Set();

  // Fetch blocked slots for the selected date
  useEffect(() => {
    let mounted = true;
    async function loadBlocked() {
      setLoadingDay(true);
      try {
        const res = await backendRequest<{ blocked_slots: string[] }>("GET", `/booking/blocked/${selectedYMD}`);
        const blocked: string[] = 'blocked_slots' in res ? res.blocked_slots : [];
        if (!mounted) return;
        // Map HH:MM into slot indices
        const set = new Set<number>();
        blocked.forEach((hhmm) => {
          const [h, m] = hhmm.split(":").map((n) => parseInt(n));
          const total = h * 60 + m;
          const idx = slots.indexOf(total);
          if (idx !== -1) set.add(idx);
        });
        setCanceled((prev) => ({ ...prev, [dayKey]: set }));
      } catch {
        // If API not ready, just show all as available silently
        setCanceled((prev) => ({ ...prev, [dayKey]: new Set() }));
      } finally {
        if (mounted) setLoadingDay(false);
      }
    }
    loadBlocked();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayIdx]);

  const toggleCancel = async (slotNum: number) => {
    const isBlocked = canceledSet.has(slotNum);
    // Optimistic UI update
    setCanceled((prev) => {
      const copy = { ...prev };
      const set = new Set(copy[dayKey] ? [...copy[dayKey]] : []);
      if (isBlocked) set.delete(slotNum); else set.add(slotNum);
      copy[dayKey] = set;
      return copy;
    });

    const action = isBlocked ? "unblock" : "block";
    const slot24 = to24h(slots[slotNum]);
    try {
      const res = await backendRequest("POST", "/booking/update-slot", {
        date: selectedYMD,
        slot: slot24,
        action
      });
      if ('success' in res && (res as { success?: boolean }).success === false) {
        throw new Error('detail' in res ? String((res as { detail?: unknown }).detail) : 'Failed');
      }
      notyf.success(`${action === "block" ? "Blocked" : "Unblocked"} ${slot24} for ${selectedYMD}`);
    } catch {
      // Revert on error
      setCanceled((prev) => {
        const copy = { ...prev };
        const set = new Set(copy[dayKey] ? [...copy[dayKey]] : []);
        if (isBlocked) set.add(slotNum); else set.delete(slotNum);
        copy[dayKey] = set;
        return copy;
      });
      notyf.error("Could not update slot. Please try again.");
    }
  };

  // Group slots by hour for better organization
  const groupedSlots: { [hour: string]: number[] } = {};
  slots.forEach(slot => {
    const hour = Math.floor(slot / 60);
    if (!groupedSlots[hour]) groupedSlots[hour] = [];
    groupedSlots[hour].push(slot);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Slots</h1>
        <div className="relative">
          <select
            className="appearance-none px-4 py-2 text-base border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDayIdx}
            onChange={(ev) => setSelectedDayIdx(parseInt(ev.target.value))}
          >
            {DAY_OPTIONS.map((opt, idx) => (
              <option key={opt.label} value={idx}>{opt.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-lg font-semibold text-blue-800">{dateLabel}</div>
        <div className="text-sm text-blue-600 mt-1">
          {loadingDay ? "Loading blocked slots..." : "Click on time slots to mark them as unavailable"}
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-2">
        {Object.entries(groupedSlots).map(([hour, hourSlots]) => (
          <div key={hour} className="mb-6">
            <div className="text-lg font-semibold text-gray-700 mb-3 pl-2 border-l-4 border-blue-500">
              {formatTime(parseInt(hour) * 60)}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {hourSlots.map((min, idx) => {
                const slotIndex = slots.indexOf(min);
                const canceledThis = canceledSet.has(slotIndex);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleCancel(slotIndex)}
                    className={`p-4 rounded-xl text-base font-medium transition-all flex flex-col items-center justify-center gap-2 min-h-[80px] ${
                      canceledThis 
                        ? "bg-red-100 border-2 border-red-300 text-red-700 line-through" 
                        : "bg-green-50 border-2 border-green-200 text-gray-800 hover:bg-green-100 hover:border-green-400 hover:shadow-md"
                    }`}
                  >
                    <span className="font-semibold">{formatTime(min)}</span>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                      canceledThis ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                    }`}>
                      {canceledThis ? "Busy" : "Available"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center border-t pt-4">
        Changes update instantly • Click any time slot to toggle availability
      </div>
    </div>
  );
}