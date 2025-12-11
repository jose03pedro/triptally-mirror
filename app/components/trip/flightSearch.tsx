"use client";
import { useState } from "react";

export default function FlightSearch({ tripId }: { tripId: string }) {
  const [number, setNumber] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ num: number, date });
      const res = await fetch(`/api/flights?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Search failed");
      setResult(json);
    } catch (e: any) {
      setError(e.message || "Failed to search");
    } finally {
      setLoading(false);
    }
  }

  async function attachToTrip() {
    if (!result?.data) return;
    const primary = Array.isArray(result.data) ? result.data[0] : result.data;
    const payload = {
      number: (primary?.number || number).toString(),
      date,
    };
    const res = await fetch(`/api/trips/${tripId}/flights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json?.error || "Failed to attach flight");
    } else {
      setError(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium">Flight number</label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. KL1846"
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={search}
          disabled={loading || !number || !date}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {result?.data && (
        <div className="border rounded p-3">
          <p className="text-sm text-gray-600">Source: {result.source}</p>
          {Array.isArray(result.data) ? (
            <ul className="space-y-2">
              {result.data.map((f: any, idx: number) => (
                <li key={idx} className="border rounded p-2">
                  <div className="font-medium">{f.number} — {f.status}</div>
                  <div className="text-sm text-gray-700">{f.airline?.name}</div>
                  <div className="text-sm">{f.departure?.airport?.name} → {f.arrival?.airport?.name}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <div className="font-medium">{result.data.number} — {result.data.status}</div>
              <div className="text-sm text-gray-700">{result.data.airline?.name}</div>
              <div className="text-sm">{result.data.departure?.airport?.name} → {result.data.arrival?.airport?.name}</div>
            </div>
          )}
          <div className="mt-3">
            <button
              onClick={attachToTrip}
              className="bg-green-600 text-white px-3 py-2 rounded"
            >
              Add to Trip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
