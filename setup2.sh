#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"

write_file () {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "✓ wrote $path"
}

python_patch () {
  python3 - "$@" <<'PY'
import sys, pathlib

mode = sys.argv[1]
path = pathlib.Path(sys.argv[2])

text = path.read_text(encoding="utf-8")

if mode == "ensure_import_mongoose":
    needle = 'import "@/app/models/PackingItem";\n'
    if needle not in text:
        # insert after last model import
        lines = text.splitlines(True)
        insert_at = 0
        for i, ln in enumerate(lines):
            if ln.startswith('import "@/app/models/'):
                insert_at = i + 1
        lines.insert(insert_at, needle)
        path.write_text("".join(lines), encoding="utf-8")
        print(f"✓ patched {path} (added PackingItem import)")
    else:
        print(f"✓ {path} already has PackingItem import")

elif mode == "patch_trip_page":
    # 1) ensure import
    import_line = 'import { PackingListSection } from "@/app/components/trip/packingList";\n'
    if import_line not in text:
        lines = text.splitlines(True)
        # place after FlightList import if possible
        insert_at = 0
        for i, ln in enumerate(lines):
            if 'from "@/app/components/trip/flightList"' in ln:
                insert_at = i + 1
                break
        if insert_at == 0:
            # fallback: after last import
            for i, ln in enumerate(lines):
                if ln.startswith("import "):
                    insert_at = i + 1
        lines.insert(insert_at, import_line)
        text = "".join(lines)

    # 2) ensure JSX section (insert after Flights dashboard block, before </section>)
    if "<PackingListSection" not in text:
        marker = "          </section>"
        idx = text.find(marker)
        if idx == -1:
            raise SystemExit("Couldn't find </section> marker in trip page to insert PackingListSection")

        snippet = """
            {/* Packing List section */}
            {showItinerary && (
              <div className="fade-up fade-up-delay-4">
                <PackingListSection tripId={tripId as string} isOwner={isOwner} />
              </div>
            )}
"""
        text = text[:idx] + snippet + text[idx:]

    # 3) remove weird/unused model import if present
    text = text.replace('import user from "@/app/models/User";\n', '')

    path.write_text(text, encoding="utf-8")
    print(f"✓ patched {path} (import + JSX)")

else:
    raise SystemExit("Unknown mode")
PY
}

# 1) app/models/PackingItem.ts
write_file "app/models/PackingItem.ts" <<'EOF'
import mongoose, { Schema, Document, Types } from "mongoose";

export type PackingItemSource = "base" | "weather" | "profile";

export interface PackingItemDocument extends Document {
  trip: Types.ObjectId;
  name: string;
  category: string;
  required: boolean;
  checked: boolean;
  quantity: number;
  source: PackingItemSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PackingItemSchema = new Schema<PackingItemDocument>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    required: { type: Boolean, default: false },
    checked: { type: Boolean, default: false },
    quantity: { type: Number, default: 1 },
    source: {
      type: String,
      enum: ["base", "weather", "profile"],
      default: "base",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Compound index for efficient queries and duplicate prevention
PackingItemSchema.index({ trip: 1, name: 1 }, { unique: true });

const PackingItem =
  mongoose.models.PackingItem ||
  mongoose.model<PackingItemDocument>("PackingItem", PackingItemSchema);

export default PackingItem;
EOF

# 2) lib/mongoose.ts (ensure import)
python_patch ensure_import_mongoose "lib/mongoose.ts"

# 3) lib/packing/presets.ts
write_file "lib/packing/presets.ts" <<'EOF'
export interface PackingPresetItem {
  name: string;
  category: string;
  required: boolean;
}

export const BASE_ITEMS: PackingPresetItem[] = [
  // Documents
  { name: "Passport / ID", category: "Documents", required: true },
  { name: "Travel insurance documents", category: "Documents", required: true },
  { name: "Wallet / Credit cards", category: "Documents", required: true },
  { name: "Boarding passes / Tickets", category: "Documents", required: false },
  { name: "Hotel reservations", category: "Documents", required: false },

  // Electronics
  { name: "Phone + charger", category: "Electronics", required: true },
  { name: "Power bank", category: "Electronics", required: false },
  { name: "Universal adapter", category: "Electronics", required: false },
  { name: "Headphones", category: "Electronics", required: false },

  // Toiletries
  { name: "Toothbrush & toothpaste", category: "Toiletries", required: true },
  { name: "Deodorant", category: "Toiletries", required: false },
  { name: "Shampoo & conditioner", category: "Toiletries", required: false },
  { name: "Medications", category: "Toiletries", required: false },

  // Clothing basics
  { name: "Underwear", category: "Clothing", required: true },
  { name: "Socks", category: "Clothing", required: true },
  { name: "Comfortable walking shoes", category: "Clothing", required: true },

  // Health & Safety
  { name: "First aid kit", category: "Health", required: false },
  { name: "Hand sanitizer", category: "Health", required: false },
];

export interface WeatherSummary {
  coldDays: boolean;
  rainyDays: boolean;
  hotDays: boolean;
}

export function weatherBasedItems(weatherSummary: WeatherSummary): PackingPresetItem[] {
  const items: PackingPresetItem[] = [];

  if (weatherSummary.coldDays) {
    items.push(
      { name: "Warm jacket", category: "Clothing", required: true },
      { name: "Gloves", category: "Clothing", required: false },
      { name: "Scarf", category: "Clothing", required: false },
      { name: "Warm hat / beanie", category: "Clothing", required: false }
    );
  }

  if (weatherSummary.rainyDays) {
    items.push(
      { name: "Umbrella", category: "Accessories", required: true },
      { name: "Rain jacket / poncho", category: "Clothing", required: false },
      { name: "Waterproof shoes", category: "Clothing", required: false }
    );
  }

  if (weatherSummary.hotDays) {
    items.push(
      { name: "Sunscreen (SPF 30+)", category: "Health", required: true },
      { name: "Sunglasses", category: "Accessories", required: false },
      { name: "Hat / cap", category: "Clothing", required: false },
      { name: "Light breathable clothing", category: "Clothing", required: false }
    );
  }

  return items;
}

export function getDurationBasedItems(tripDays: number): PackingPresetItem[] {
  const items: PackingPresetItem[] = [];

  if (tripDays > 7) {
    items.push(
      { name: "Laundry bag", category: "Accessories", required: false },
      { name: "Travel-size detergent", category: "Toiletries", required: false }
    );
  }

  return items;
}
EOF

# 4) lib/packing/generatePacking.ts
write_file "lib/packing/generatePacking.ts" <<'EOF'
import {
  BASE_ITEMS,
  weatherBasedItems,
  getDurationBasedItems,
  PackingPresetItem,
  WeatherSummary,
} from "./presets";

export interface WeatherDay {
  date: string;
  city: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  precipitationChance: number;
}

export interface GeneratedPackingItem extends PackingPresetItem {
  source: "base" | "weather" | "profile";
}

export function summarizeWeather(days: WeatherDay[]): WeatherSummary {
  if (!days || days.length === 0) {
    return { coldDays: false, hotDays: false, rainyDays: false };
  }

  const coldDays = days.some((d) => d.maxTemp <= 12);
  const hotDays = days.some((d) => d.maxTemp >= 28);
  const rainyDays = days.some(
    (d) =>
      d.precipitationChance >= 0.5 ||
      d.condition.toLowerCase().includes("rain") ||
      d.condition.toLowerCase().includes("shower")
  );

  return { coldDays, hotDays, rainyDays };
}

export function calculateTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function generatePackingItems(
  weatherDays: WeatherDay[],
  startDate?: string,
  endDate?: string
): GeneratedPackingItem[] {
  const summary = summarizeWeather(weatherDays);

  const baseItems: GeneratedPackingItem[] = BASE_ITEMS.map((item) => ({
    ...item,
    source: "base" as const,
  }));

  const weatherItems: GeneratedPackingItem[] = weatherBasedItems(summary).map(
    (item) => ({ ...item, source: "weather" as const })
  );

  let durationItems: GeneratedPackingItem[] = [];
  if (startDate && endDate) {
    const tripDays = calculateTripDays(startDate, endDate);
    durationItems = getDurationBasedItems(tripDays).map((item) => ({
      ...item,
      source: "base" as const,
    }));
  }

  const allItems = [...baseItems, ...weatherItems, ...durationItems];
  const seen = new Set<string>();
  const uniqueItems: GeneratedPackingItem[] = [];

  for (const item of allItems) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  }

  uniqueItems.sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  return uniqueItems;
}
EOF

# 5) app/api/trips/[id]/packing/route.ts
write_file "app/api/trips/[id]/packing/route.ts" <<'EOF'
import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import PackingItem from "@/app/models/PackingItem";
import Trip from "@/app/models/Trip";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

// GET - Fetch all packing items for a trip
export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!trip.isPublic && !isOwner) {
      return NextResponse.json({ error: "This trip is private" }, { status: 403 });
    }

    const items = await PackingItem.find({ trip: id })
      .sort({ required: -1, category: 1, name: 1 })
      .lean();

    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("Error fetching packing list:", err);
    return NextResponse.json({ error: "Failed to fetch packing list" }, { status: 500 });
  }
}

// POST - Create a single packing item manually
export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the trip owner can add packing items" },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const existing = await PackingItem.findOne({
      trip: id,
      name: { $regex: new RegExp(`^${body.name.trim()}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Item already exists in packing list" },
        { status: 409 }
      );
    }

    const item = await PackingItem.create({
      trip: id,
      name: body.name.trim(),
      category: body.category || "General",
      required: body.required ?? false,
      checked: body.checked ?? false,
      quantity: body.quantity ?? 1,
      source: body.source ?? "base",
      notes: body.notes?.trim() || undefined,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Error creating packing item:", err);
    return NextResponse.json({ error: "Failed to create packing item" }, { status: 500 });
  }
}

// PATCH - Toggle checked status or update item
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the trip owner can edit packing items" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemId, checked, name, category, required, quantity, notes } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {};
    if (typeof checked === "boolean") updateFields.checked = checked;
    if (name !== undefined) updateFields.name = name.trim();
    if (category !== undefined) updateFields.category = category;
    if (typeof required === "boolean") updateFields.required = required;
    if (quantity !== undefined) updateFields.quantity = quantity;
    if (notes !== undefined) updateFields.notes = notes?.trim() || undefined;

    const updatedItem = await PackingItem.findOneAndUpdate(
      { _id: itemId, trip: id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: "Packing item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (err) {
    console.error("Error updating packing item:", err);
    return NextResponse.json({ error: "Failed to update packing item" }, { status: 500 });
  }
}

// DELETE - Remove a packing item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the trip owner can delete packing items" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const deleted = await PackingItem.findOneAndDelete({ _id: itemId, trip: id });

    if (!deleted) {
      return NextResponse.json({ error: "Packing item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting packing item:", err);
    return NextResponse.json({ error: "Failed to delete packing item" }, { status: 500 });
  }
}
EOF

# 6) app/api/trips/[id]/packing/auto/route.ts
write_file "app/api/trips/[id]/packing/auto/route.ts" <<'EOF'
import { NextResponse } from "next/server";
import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";
import PackingItem from "@/app/models/PackingItem";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { generatePackingItems, WeatherDay } from "@/lib/packing/generatePacking";

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await connectionToDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
    }

    const trip: any = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isOwner =
      currentUser && trip.user?.toString() === currentUser.id?.toString();

    if (!isOwner) {
      return NextResponse.json(
        { error: "Only the trip owner can generate packing list" },
        { status: 403 }
      );
    }

    const startDate = trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : null;
    const endDate = trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : null;
    const mainCity = trip.cities?.[0]?.name;

    let weatherDays: WeatherDay[] = [];

    if (mainCity && startDate && endDate) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const weatherRes = await fetch(
          `${baseUrl}/api/weather?city=${encodeURIComponent(mainCity)}&start=${startDate}&end=${endDate}`,
          { cache: "no-store" }
        );

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          weatherDays = weatherData.days || [];
        } else {
          console.warn("Weather API returned non-OK status, using base items only");
        }
      } catch (weatherErr) {
        console.warn("Failed to fetch weather, using base items only:", weatherErr);
      }
    }

    const itemsToCreate = generatePackingItems(
      weatherDays,
      startDate || undefined,
      endDate || undefined
    );

    const existingItems = await PackingItem.find({ trip: id }).lean();
    const existingNames = new Set(existingItems.map((item: any) => item.name.toLowerCase()));

    const newItems = itemsToCreate.filter(
      (item) => !existingNames.has(item.name.toLowerCase())
    );

    if (newItems.length === 0) {
      return NextResponse.json(
        { message: "Packing list is already up to date", itemsAdded: 0, totalItems: existingItems.length },
        { status: 200 }
      );
    }

    const createdItems = await PackingItem.insertMany(
      newItems.map((item) => ({
        trip: id,
        name: item.name,
        category: item.category,
        required: item.required,
        checked: false,
        quantity: 1,
        source: item.source,
      }))
    );

    return NextResponse.json(
      {
        message: "Packing list generated successfully",
        itemsAdded: createdItems.length,
        totalItems: existingItems.length + createdItems.length,
        items: createdItems,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error generating packing list:", err);
    return NextResponse.json({ error: "Failed to generate packing list" }, { status: 500 });
  }
}
EOF

# 7) Component packing list (frontend)
write_file "app/components/trip/packingList.tsx" <<'EOF'
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
EOF

# 8) Trip page patch (import + JSX insert)
python_patch patch_trip_page "app/trips/[tripId]/page.tsx"

# 9) types/packing/types.ts
write_file "types/packing/types.ts" <<'EOF'
export type PackingItemSource = "base" | "weather" | "profile";

export interface PackingItem {
  _id: string;
  trip: string;
  name: string;
  category: string;
  required: boolean;
  checked: boolean;
  quantity: number;
  source: PackingItemSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackingListResponse {
  items: PackingItem[];
}

export interface GeneratePackingResponse {
  message: string;
  itemsAdded: number;
  totalItems: number;
  items?: PackingItem[];
}
EOF

echo ""
echo "✅ Packing feature aplicada."
echo "Sugestão: corre 'npm run build' para validares."
