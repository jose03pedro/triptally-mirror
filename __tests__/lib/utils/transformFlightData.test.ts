import { transformFlightData } from "@/lib/utils";

describe("transformFlightData", () => {
  const mockApiResponse = {
    number: "TP 123",
    status: "Scheduled",
    isCargo: false,
    lastUpdatedUtc: "2025-12-15T10:00:00Z",
    aircraft: {
      model: "Airbus A320",
    },
    airline: {
      name: "TAP Air Portugal",
      iata: "TP",
      icao: "TAP",
    },
    departure: {
      airport: {
        iata: "LIS",
        icao: "LPPT",
        name: "Lisbon Portela Airport",
        municipalityName: "Lisbon",
        countryCode: "PT",
      },
      terminal: "1",
      gate: "A12",
      scheduledTime: {
        utc: "2025-12-15T08:30:00Z",
        local: "2025-12-15T08:30:00",
      },
    },
    arrival: {
      airport: {
        iata: "OPO",
        icao: "LPPR",
        name: "Porto Airport",
        municipalityName: "Porto",
        countryCode: "PT",
      },
      scheduledTime: {
        utc: "2025-12-15T09:30:00Z",
        local: "2025-12-15T09:30:00",
      },
      predictedTime: {
        utc: "2025-12-15T09:35:00Z",
        local: "2025-12-15T09:35:00",
      },
    },
  };

  it("should transform a complete API response correctly", () => {
    const result = transformFlightData(mockApiResponse);

    expect(result.flightNumber).toBe("TP123");
    expect(result.status).toBe("Scheduled");
    expect(result.isCargo).toBe(false);
    expect(result.aircraft.model).toBe("Airbus A320");
    expect(result.airline.name).toBe("TAP Air Portugal");
    expect(result.airline.iata).toBe("TP");
    expect(result.airline.icao).toBe("TAP");
  });

  it("should transform departure airport correctly", () => {
    const result = transformFlightData(mockApiResponse);

    expect(result.departure.airport.iata).toBe("LIS");
    expect(result.departure.airport.icao).toBe("LPPT");
    expect(result.departure.airport.name).toBe("Lisbon Portela Airport");
    expect(result.departure.airport.city).toBe("Lisbon");
    expect(result.departure.airport.countryCode).toBe("PT");
    expect(result.departure.terminal).toBe("1");
    expect(result.departure.gate).toBe("A12");
  });

  it("should transform arrival airport correctly", () => {
    const result = transformFlightData(mockApiResponse);

    expect(result.arrival.airport.iata).toBe("OPO");
    expect(result.arrival.airport.icao).toBe("LPPR");
    expect(result.arrival.airport.name).toBe("Porto Airport");
    expect(result.arrival.airport.city).toBe("Porto");
    expect(result.arrival.airport.countryCode).toBe("PT");
  });

  it("should convert scheduled times to Date objects", () => {
    const result = transformFlightData(mockApiResponse);

    expect(result.departure.scheduledTimeUtc).toBeInstanceOf(Date);
    expect(result.departure.scheduledTimeLocal).toBeInstanceOf(Date);
    expect(result.arrival.scheduledTimeUtc).toBeInstanceOf(Date);
    expect(result.arrival.scheduledTimeLocal).toBeInstanceOf(Date);
  });

  it("should convert predicted/actual times to Date objects", () => {
    const result = transformFlightData(mockApiResponse);

    expect(result.arrival.actualTimeUtc).toBeInstanceOf(Date);
    expect(result.arrival.actualTimeLocal).toBeInstanceOf(Date);
  });

  it("should remove spaces from flight number", () => {
    const result = transformFlightData({ number: "FR 1234" });
    expect(result.flightNumber).toBe("FR1234");

    const result2 = transformFlightData({ number: "BA  456" });
    expect(result2.flightNumber).toBe("BA456");
  });

  it("should handle missing flight number", () => {
    const result = transformFlightData({});
    expect(result.flightNumber).toBe("UNKNOWN");
  });

  it("should handle missing aircraft model", () => {
    const result = transformFlightData({});
    expect(result.aircraft.model).toBe("UNKNOWN");
  });

  it("should handle missing airline data", () => {
    const result = transformFlightData({});
    expect(result.airline.name).toBe("UNKNOWN");
    expect(result.airline.iata).toBeUndefined();
    expect(result.airline.icao).toBeUndefined();
  });

  it("should handle missing departure airport data", () => {
    const result = transformFlightData({});
    expect(result.departure.airport.iata).toBe("UNKNOWN");
    expect(result.departure.airport.icao).toBe("UNKNOWN");
    expect(result.departure.airport.name).toBe("UNKNOWN");
    expect(result.departure.airport.city).toBe("UNKNOWN");
    expect(result.departure.airport.countryCode).toBe("UNKNOWN");
  });

  it("should handle missing arrival airport data", () => {
    const result = transformFlightData({});
    expect(result.arrival.airport.iata).toBe("UNKNOWN");
    expect(result.arrival.airport.icao).toBe("UNKNOWN");
    expect(result.arrival.airport.name).toBe("UNKNOWN");
    expect(result.arrival.airport.city).toBe("UNKNOWN");
    expect(result.arrival.airport.countryCode).toBe("UNKNOWN");
  });

  it("should default status to Unknown", () => {
    const result = transformFlightData({});
    expect(result.status).toBe("Unknown");
  });

  it("should default isCargo to false", () => {
    const result = transformFlightData({});
    expect(result.isCargo).toBe(false);
  });

  it("should handle cargo flights", () => {
    const result = transformFlightData({ isCargo: true });
    expect(result.isCargo).toBe(true);
  });

  it("should set date to midnight of scheduled departure date", () => {
    const result = transformFlightData(mockApiResponse);
    const date = result.date;

    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getMilliseconds()).toBe(0);
  });

  it("should handle missing scheduled times gracefully", () => {
    const result = transformFlightData({
      departure: { airport: {} },
      arrival: { airport: {} },
    });

    expect(result.departure.scheduledTimeUtc).toBeUndefined();
    expect(result.departure.scheduledTimeLocal).toBeUndefined();
    expect(result.arrival.scheduledTimeUtc).toBeUndefined();
    expect(result.arrival.scheduledTimeLocal).toBeUndefined();
  });

  it("should handle partial API response", () => {
    const partialResponse = {
      number: "RY 5678",
      airline: { name: "Ryanair" },
      departure: {
        airport: { iata: "STN" },
      },
    };

    const result = transformFlightData(partialResponse);

    expect(result.flightNumber).toBe("RY5678");
    expect(result.airline.name).toBe("Ryanair");
    expect(result.departure.airport.iata).toBe("STN");
    expect(result.departure.airport.icao).toBe("UNKNOWN");
    expect(result.arrival.airport.iata).toBe("UNKNOWN");
  });
});
