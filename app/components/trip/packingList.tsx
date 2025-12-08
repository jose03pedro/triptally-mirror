"use client";

import { useEffect, useState } from "react";

interface PackingItem {
  _id: string;
  name: string;
  category: string;
  required: boolean;
  checked: boolean;
  quantity?: number;
  source: "base" | "weather" | "profile";
  notes?: string;
}

export function PackingListSection({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/trips/${tripId}/packing`);
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (tripId) load();
  }, [tripId]);

  async function handleGenerate() {
    setGenerating(true);
    const res = await fetch(`/api/trips/${tripId}/packing/auto`, {
      method: "POST",
    });
    if (res.ok) {
      // ou recarregas tudo:
      await load();
    }
    setGenerating(false);
  }

  async function toggleChecked(item: PackingItem) {
    const res = await fetch(`/api/trips/${tripId}/packing`, {
      method: "PATCH",
      body: JSON.stringify({
        itemId: item._id,
        checked: !item.checked,
      }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, checked: !item.checked } : i
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
        <p className="text-sm text-slate-500">Loading packing list…</p>
      </div>
    );
  }

  const itemsByCategory = items.reduce<Record<string, PackingItem[]>>(
    (acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            Packing list
          </h2>
          <p className="text-xs text-slate-500">
            Smart suggestions based on your trip and weather. You can edit
            everything freely.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn btn-sm btn-primary"
        >
          {generating ? "Generating..." : "Generate smart list"}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          No items yet. Click &quot;Generate smart list&quot; to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                {category}
              </h3>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecked(item)}
                      />
                      <span className={item.required ? "font-medium" : ""}>
                        {item.name}
                      </span>
                      {item.source !== "base" && (
                        <span className="text-[10px] text-slate-400 uppercase">
                          {item.source}
                        </span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
