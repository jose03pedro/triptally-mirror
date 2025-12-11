export interface IFlight {
  date: Date;
  flightNumber: string;
  tripId?: string;

  aircraft: {
    model: string;
  };

  airline: {
    name: string;
    iata?: string;
    icao?: string;
  };

  isCargo: boolean;
  status: string;
  lastUpdated: Date;

  departure: {
    airport: {
      iata: string;
      icao: string;
      name: string;
      city: string;
      countryCode: string;
    };
    terminal?: string;
    gate?: string;
    scheduledTimeUtc?: Date;
    scheduledTimeLocal?: Date;
  };

  arrival: {
    airport: {
      iata: string;
      icao: string;
      name: string;
      city: string;
      countryCode: string;
    };
    scheduledTimeUtc?: Date;
    scheduledTimeLocal?: Date;
    actualTimeUtc?: Date;
    actualTimeLocal?: Date;
  };
}

export interface RawFlightApiResponse {
  greatCircleDistance: {
    meter: number;
    km: number;
    mile: number;
    nm: number;
    feet: number;
  };

  departure: {
    airport: {
      icao: string;
      iata: string;
      name: string;
      shortName?: string;
      municipalityName: string;
      countryCode: string;
      timeZone: string;
      location: { lat: number; lon: number };
    };
    scheduledTime?: { utc: string; local: string };
    terminal?: string;
    gate?: string;
  };

  arrival: {
    airport: {
      icao: string;
      iata: string;
      name: string;
      shortName?: string;
      municipalityName: string;
      countryCode: string;
      timeZone: string;
      location: { lat: number; lon: number };
    };
    scheduledTime?: { utc: string; local: string };
    predictedTime?: { utc: string; local: string };
    gate?: string;
  };

  lastUpdatedUtc: string;
  number: string;
  status: string;
  isCargo: boolean;

  aircraft?: { model?: string };
  airline?: {
    name?: string;
    iata?: string;
    icao?: string;
  };
}
