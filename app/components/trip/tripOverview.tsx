import { Trip } from "@/types/trip/types";

interface TripOverviewProps {
  trip: Trip;
}

export function TripOverview({ trip }: TripOverviewProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 md:p-5 fade-up fade-up-delay-2">
      <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
        Overview
      </h2>
      <p className="text-xs md:text-sm text-slate-600 mb-3">
        Here you will later see itinerary, key highlights and AI-generated
        suggestions for this trip. For now this section is a simple overview of
        your dates and destinations.
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs md:text-sm text-slate-700">
        <div>
          <dt className="font-medium">Start</dt>
          <dd>{new Date(trip.startDate).toLocaleString()}</dd>
        </div>
        <div>
          <dt className="font-medium">End</dt>
          <dd>{new Date(trip.endDate).toLocaleString()}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium">Cities</dt>
          <dd>
            {trip.cities
              ?.map((c) => `${c.name}, ${c.country ?? ""}`)
              .join(" · ") || "No cities added"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Currency</dt>
          <dd>{trip.currency?.symbol}</dd>
        </div>
      </dl>
    </div>
  );
}
