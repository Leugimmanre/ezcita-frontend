// src/components/settingsComponents/DayBlocksEditor.jsx
import { useMemo, useState } from "react";
import { daysOfWeek } from "@/data/index";

// Mapeo de días en español a inglés para las claves del backend
const dayKeyMap = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
};

// Valida formato HH:mm simple
const isHHMM = (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(v || ""));

export default function DayBlocksEditor({ value, onChange, interval = 30 }) {
  const [expandedDay, setExpandedDay] = useState(null);
  const dayBlocks = useMemo(() => value || {}, [value]);

  const toggleDay = (dayId) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  const changeDay = (dayKey, next) => {
    onChange?.({ ...(dayBlocks || {}), [dayKey]: next });
  };

  const addBlock = (dayKey) => {
    const list = Array.isArray(dayBlocks[dayKey]) ? [...dayBlocks[dayKey]] : [];
    list.push({ start: "09:00", end: "18:00" });
    changeDay(dayKey, list);
  };

  const removeBlock = (dayKey, idx) => {
    const list = Array.isArray(dayBlocks[dayKey]) ? [...dayBlocks[dayKey]] : [];
    list.splice(idx, 1);
    changeDay(dayKey, list);
  };

  const updateBlock = (dayKey, idx, field, val) => {
    const list = Array.isArray(dayBlocks[dayKey]) ? [...dayBlocks[dayKey]] : [];
    const row = { ...(list[idx] || {}) };
    row[field] = val;
    list[idx] = row;
    changeDay(dayKey, list);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {daysOfWeek.map((day) => {
          const dayKey = dayKeyMap[day.id];
          const list = Array.isArray(dayBlocks[dayKey])
            ? dayBlocks[dayKey]
            : [];

          return (
            <div key={day.id}>
              <button
                type="button"
                onClick={() => toggleDay(day.id)}
                className={`px-3 py-2 text-sm rounded-md ${
                  expandedDay === day.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {day.name} {list.length > 0 && `(${list.length})`}
              </button>
            </div>
          );
        })}
      </div>

      {expandedDay !== null && (
        <DayBlockForm
          day={daysOfWeek.find((d) => d.id === expandedDay)}
          dayKey={dayKeyMap[expandedDay]}
          blocks={dayBlocks[dayKeyMap[expandedDay]] || []}
          onAddBlock={addBlock}
          onRemoveBlock={removeBlock}
          onUpdateBlock={updateBlock}
          interval={interval}
        />
      )}
    </div>
  );
}

const DayBlockForm = ({
  day,
  dayKey,
  blocks,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
}) => {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">{day.name}</h4>
        <button
          type="button"
          onClick={() => onAddBlock(dayKey)}
          className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Añadir bloque
        </button>
      </div>

      {blocks.length === 0 && (
        <p className="text-xs text-gray-500 mb-3">
          Sin bloques. El día estará cerrado.
        </p>
      )}

      <div className="space-y-2">
        {blocks.map((b, idx) => {
          const badStart = !isHHMM(b.start);
          const badEnd = !isHHMM(b.end);
          return (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="time"
                value={b.start || ""}
                onChange={(e) =>
                  onUpdateBlock(dayKey, idx, "start", e.target.value)
                }
                className={`border rounded-lg px-2 py-1 text-sm ${
                  badStart ? "border-red-400" : ""
                }`}
              />
              <span className="text-sm text-gray-600">a</span>
              <input
                type="time"
                value={b.end || ""}
                onChange={(e) =>
                  onUpdateBlock(dayKey, idx, "end", e.target.value)
                }
                className={`border rounded-lg px-2 py-1 text-sm ${
                  badEnd ? "border-red-400" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => onRemoveBlock(dayKey, idx)}
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Quitar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
