"use client";

import IconText from "@/app/components/ui/icon-text";
import { SearchFlightModal } from "@/app/components/trip/searchFlightModal";
import { Portal } from "../ui/portal";
import { useAuth } from "@/lib/hook/useAuth";

interface AddFlightProps {
  tripId: string;
  userId: string;
  onFlightAdded?: (flight: any) => void;
}

export function AddFlight({ tripId, userId, onFlightAdded }: AddFlightProps) {
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
        data-bs-target="#searchFlightModal"
      >
        <IconText icon="flight" text="Add flight" color="#fff" />
      </button>

      <Portal>
        <SearchFlightModal tripId={tripId} onFlightAdded={onFlightAdded} />
      </Portal>
    </>
  );
}
