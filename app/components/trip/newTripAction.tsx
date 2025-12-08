"use client";

import { useState } from "react";
import CreateTripModal from "@/app/components/trip/createTripModal";

export default function NewTripAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 transition shadow-sm hover:shadow-md"
      >
        <span className="material-icons text-xl">add_circle_outline</span>
        New Trip
      </button>

      {isOpen && <CreateTripModal onClose={() => setIsOpen(false)} />}
    </>
  );
}