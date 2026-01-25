import { Flight } from "@/types/flight/types";

export function transformFlightData(apiData: any): Flight {
  const toMidnight = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  return {
    date: apiData.departure?.scheduledTime?.utc
      ? toMidnight(apiData.departure.scheduledTime.utc)
      : new Date(new Date().setHours(0, 0, 0, 0)),

    flightNumber: apiData.number?.replace(/\s+/g, "") || "UNKNOWN",

    aircraft: {
      model: apiData.aircraft?.model || "UNKNOWN",
    },

    airline: {
      name: apiData.airline?.name || "UNKNOWN",
      iata: apiData.airline?.iata,
      icao: apiData.airline?.icao,
    },

    isCargo: apiData.isCargo || false,
    status: apiData.status || "Unknown",
    lastUpdated: apiData.lastUpdatedUtc 
      ? toMidnight(apiData.lastUpdatedUtc) 
      : new Date(new Date().setHours(0, 0, 0, 0)),

    departure: {
      airport: {
        iata: apiData.departure?.airport?.iata || "UNKNOWN",
        icao: apiData.departure?.airport?.icao || "UNKNOWN",
        name: apiData.departure?.airport?.name || "UNKNOWN",
        city: apiData.departure?.airport?.municipalityName || "UNKNOWN",
        countryCode: apiData.departure?.airport?.countryCode || "UNKNOWN",
      },
      terminal: apiData.departure?.terminal,
      gate: apiData.departure?.gate,
      scheduledTimeUtc: apiData.departure?.scheduledTime?.utc
        ? new Date(apiData.departure.scheduledTime.utc)
        : undefined,
      scheduledTimeLocal: apiData.departure?.scheduledTime?.local
        ? new Date(apiData.departure.scheduledTime.local)
        : undefined,
    },

    arrival: {
      airport: {
        iata: apiData.arrival?.airport?.iata || "UNKNOWN",
        icao: apiData.arrival?.airport?.icao || "UNKNOWN",
        name: apiData.arrival?.airport?.name || "UNKNOWN",
        city: apiData.arrival?.airport?.municipalityName || "UNKNOWN",
        countryCode: apiData.arrival?.airport?.countryCode || "UNKNOWN",
      },
      scheduledTimeUtc: apiData.arrival?.scheduledTime?.utc
        ? new Date(apiData.arrival.scheduledTime.utc)
        : undefined,
      scheduledTimeLocal: apiData.arrival?.scheduledTime?.local
        ? new Date(apiData.arrival.scheduledTime.local)
        : undefined,
      actualTimeUtc: apiData.arrival?.predictedTime?.utc
        ? new Date(apiData.arrival.predictedTime.utc)
        : undefined,
      actualTimeLocal: apiData.arrival?.predictedTime?.local
        ? new Date(apiData.arrival.predictedTime.local)
        : undefined,
    },
  };
}

const EN_MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export function formatTripDateRange(start : string, end : string) {
    const s = new Date(start)
    const e = new Date(end)

    const sameYear = s.getFullYear() === e.getFullYear()

    const sDay = String(s.getDate()).padStart(2, "0")
    const eDay = String(e.getDate()).padStart(2, "0")

    const sMonth = EN_MONTHS[s.getMonth()]
    const eMonth = EN_MONTHS[e.getMonth()]

    return sameYear
        ? `${sMonth} ${sDay} - ${eMonth} ${eDay}, ${e.getFullYear()}`
        : `${sMonth} ${sDay}, ${s.getFullYear()} - ${eMonth} ${eDay}, ${e.getFullYear()}`
}
