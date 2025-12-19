"use client";

import { useEffect, useState } from "react";

interface PackingItem {
  _id: string;
  name: string;
  category: string;
  required: boolean;
  checked: boolean;
  quantity: number;
  source: "base" | "weather" | "profile";
  notes?: string;
}

interface PackingListProps {
  tripId: string;
  isOwner: boolean;
}

export function PackingListSection({ tripId, isOwner }: PackingListProps) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("General");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  const categories = [
    "Documents",
    "Electronics",
    "Clothing",
    "Toiletries",
    "Health",
    "Accessories",
    "General",
  ];

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/packing`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to load packing list");
      }
    } catch (err) {
      console.error("Error loading packing list:", err);
      setError("Failed to load packing list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tripId) loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/packing/auto`, { method: "POST" });
      if (res.ok) await loadItems();
      else {
        const errData = await res.json();
        setError(errData.error || "Failed to generate packing list");
      }
    } catch (err) {
      console.error("Error generating packing list:", err);
      setError("Failed to generate packing list");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleChecked(item: PackingItem) {
    if (!isOwner) return;

    setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, checked: !item.checked } : i)));

    try {
      const res = await fetch(`/api/trips/${tripId}/packing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item._id, checked: !item.checked }),
      });

      if (!res.ok) {
        setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, checked: item.checked } : i)));
      }
    } catch (err) {
      console.error("Error toggling item:", err);
      setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, checked: item.checked } : i)));
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim() || !isOwner) return;

    setAddingItem(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/packing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName.trim(),
          category: newItemCategory,
          required: false,
          source: "base",
        }),
      });

      if (res.ok) {
        const newItem = await res.json();
        setItems((prev) => [...prev, newItem]);
        setNewItemName("");
        setShowAddForm(false);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to add item");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item");
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!isOwner) return;

    const previousItems = [...items];
    setItems((prev) => prev.filter((i) => i._id !== itemId));

    try {
      const res = await fetch(`/api/trips/${tripId}/packing?itemId=${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        setItems(previousItems);
        const errData = await res.json();
        setError(errData.error || "Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      setItems(previousItems);
      setError("Failed to delete item");
    }
  }

  const itemsByCategory = items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case "weather":
        return "bg-info text-dark";
      case "profile":
        return "bg-secondary text-white";
      default:
        return "bg-light text-dark";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-4 md:p-5 shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-sm text-slate-500">Loading packing list…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 md:p-5 shadow-sm">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1">Packing List</h2>
          <p className="text-xs text-slate-500 mb-0">
            Smart suggestions based on your trip destination and weather forecast.
          </p>
        </div>

        {isOwner && (
          <div className="d-flex gap-2">
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-sm btn-outline-secondary">
              <span className="me-1">+</span>
              Add item
            </button>
            <button onClick={handleGenerate} disabled={generating} className="btn btn-sm btn-primary">
              {generating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="me-1">✨</span>
                  Generate smart list
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3" role="alert">
          <small>{error}</small>
          <button type="button" className="btn-close btn-close-sm float-end" onClick={() => setError(null)} />
        </div>
      )}

      {showAddForm && isOwner && (
        <form onSubmit={handleAddItem} className="card card-body bg-light mb-4">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-5">
              <label className="form-label small mb-1">Item name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g., Camera tripod"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small mb-1">Category</label>
              <select
                className="form-select form-select-sm"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-sm btn-primary flex-grow-1"
                  disabled={addingItem || !newItemName.trim()}
                >
                  {addingItem ? "Adding..." : "Add"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItemName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {totalCount > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-xs text-slate-500">
              {checkedCount} of {totalCount} items packed
            </span>
            <span className="text-xs fw-medium text-slate-700">{progressPercent}%</span>
          </div>
          <div className="progress" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-slate-300 mb-3" style={{ fontSize: "3rem" }}>
            🧳
          </div>
          <p className="text-sm text-slate-500 mb-2">No items in your packing list yet.</p>
          {isOwner && (
            <p className="text-xs text-slate-400">
              Click &quot;Generate smart list&quot; to get personalized suggestions based on your trip.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(itemsByCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categoryItems]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs fw-semibold text-slate-500 text-uppercase mb-2 d-flex align-items-center gap-2">
                  <span>{category}</span>
                  <span className="badge bg-secondary rounded-pill">
                    {categoryItems.filter((i) => i.checked).length}/{categoryItems.length}
                  </span>
                </h3>
                <ul className="list-unstyled mb-0">
                  {categoryItems.map((item) => (
                    <li
                      key={item._id}
                      className={`d-flex align-items-center justify-content-between py-2 px-2 rounded ${
                        item.checked ? "bg-light" : ""
                      }`}
                      style={{ transition: "background-color 0.2s" }}
                    >
                      <label className="d-flex align-items-center gap-2 mb-0 flex-grow-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.checked}
                          onChange={() => toggleChecked(item)}
                          disabled={!isOwner}
                          style={{ cursor: isOwner ? "pointer" : "default" }}
                        />
                        <span
                          className={`text-sm ${
                            item.checked
                              ? "text-decoration-line-through text-slate-400"
                              : item.required
                              ? "fw-medium text-slate-800"
                              : "text-slate-700"
                          }`}
                        >
                          {item.name}
                          {item.quantity > 1 && (
                            <span className="text-slate-400 ms-1">×{item.quantity}</span>
                          )}
                        </span>
                        {item.required && (
                          <span className="badge bg-warning text-dark rounded-pill px-2 py-0">
                            <small>required</small>
                          </span>
                        )}
                        {item.source !== "base" && (
                          <span className={`badge rounded-pill px-2 py-0 ${getSourceBadgeClass(item.source)}`}>
                            <small>{item.source}</small>
                          </span>
                        )}
                      </label>
                      {isOwner && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-slate-400 p-0 ms-2"
                          onClick={() => handleDeleteItem(item._id)}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 pt-3 border-top">
          <p className="text-xs text-slate-400 mb-2">Legend:</p>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge bg-light text-dark rounded-pill px-2 py-1">
              <small>base = essential items</small>
            </span>
            <span className="badge bg-info text-dark rounded-pill px-2 py-1">
              <small>weather = based on forecast</small>
            </span>
            <span className="badge bg-warning text-dark rounded-pill px-2 py-1">
              <small>required = don&apos;t forget!</small>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
