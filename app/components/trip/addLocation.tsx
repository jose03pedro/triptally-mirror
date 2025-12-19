"use client";

import IconText from "@/app/components/ui/icon-text";
import { AddLocationModal } from "@/app/components/trip/addLocationModal";
import { Portal } from "../ui/portal";
import { useAuth } from "@/lib/hook/useAuth";

interface AddLocationProps {
  tripId: string;
  userId: string;
  onLocationAdded?: (location: any) => void;
}

export function AddLocation({ tripId, userId, onLocationAdded }: AddLocationProps) {
  const session = useAuth();
  const loggedUser = session?.user;

  if (!loggedUser || loggedUser.id !== userId) {
    return null;
  }

  return (
    <>
      <button
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#addLocationModal"
      >
        <IconText icon="add_location" text="Add location" color="#fff" />
      </button>

      <Portal>
        <AddLocationModal tripId={tripId} onLocationAdded={onLocationAdded} />
      </Portal>
    </>
  );
}
