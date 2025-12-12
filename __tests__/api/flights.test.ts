// Mock the mongoose connection
jest.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

// Mock functions need to be defined before jest.mock
const mockFindOne = jest.fn();
const mockFindOneAndUpdate = jest.fn();

// Mock the Flight model
jest.mock("@/app/models/Flight", () => {
  return {
    __esModule: true,
    default: {
      findOne: (...args: any[]) => ({
        lean: () => mockFindOne(...args),
      }),
      findOneAndUpdate: (...args: any[]) => mockFindOneAndUpdate(...args),
    },
  };
});

import { GET } from "@/app/api/flights/route";

// Helper to create a mock NextRequest
function createMockRequest(url: string) {
  const urlObj = new URL(url);
  return {
    nextUrl: {
      searchParams: urlObj.searchParams,
    },
  } as any;
}

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("GET /api/flights", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.RAPIDAPI_KEY = "test-api-key";
    mockFindOne.mockReset();
    mockFindOneAndUpdate.mockReset();
    mockFetch.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return 400 if flightNumber is missing", async () => {
    const req = createMockRequest("http://localhost/api/flights?date=2025-12-15");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing parameters");
  });

  it("should return 400 if date is missing", async () => {
    const req = createMockRequest("http://localhost/api/flights?num=TP123");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing parameters");
  });

  it("should return 400 if both parameters are missing", async () => {
    const req = createMockRequest("http://localhost/api/flights");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing parameters");
  });

  it("should return cached flight data if available", async () => {
    const cachedFlight = {
      _id: "cached-id",
      flightNumber: "TP123",
      date: "2025-12-15",
      airline: { name: "TAP Air Portugal" },
      status: "Scheduled",
    };
    mockFindOne.mockResolvedValue(cachedFlight);

    const req = createMockRequest(
      "http://localhost/api/flights?num=TP123&date=2025-12-15"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("cache");
    expect(body.data).toEqual(cachedFlight);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should normalize flight number before cache lookup", async () => {
    mockFindOne.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const req = createMockRequest(
      "http://localhost/api/flights?num=tp%20123&date=2025-12-15"
    );
    await GET(req);

    expect(mockFindOne).toHaveBeenCalledWith({
      flightNumber: "TP123",
      date: "2025-12-15",
    });
  });

  it("should fetch from AeroDataBox API if not cached", async () => {
    mockFindOne.mockResolvedValue(null);

    const apiResponse = [
      {
        number: "TP123",
        status: "Scheduled",
        airline: { name: "TAP Air Portugal" },
        departure: {
          airport: { iata: "LIS", name: "Lisbon" },
          scheduledTime: { utc: "2025-12-15T08:00:00Z" },
        },
        arrival: {
          airport: { iata: "OPO", name: "Porto" },
        },
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const req = createMockRequest(
      "http://localhost/api/flights?num=TP123&date=2025-12-15"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("live");
    expect(body.data).toEqual(apiResponse);
  });

  it("should call AeroDataBox API with correct headers", async () => {
    mockFindOne.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const req = createMockRequest(
      "http://localhost/api/flights?num=TP123&date=2025-12-15"
    );
    await GET(req);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("aerodatabox.p.rapidapi.com/flights/number/TP123/2025-12-15"),
      expect.objectContaining({
        method: "GET",
        headers: {
          "x-rapidapi-key": "test-api-key",
          "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
        },
      })
    );
  });

  it("should cache flight data after fetching from API", async () => {
    mockFindOne.mockResolvedValue(null);
    mockFindOneAndUpdate.mockResolvedValue({});

    const apiResponse = [
      {
        number: "TP123",
        status: "Scheduled",
        departure: {
          airport: { iata: "LIS" },
          scheduledTime: { utc: "2025-12-15T08:00:00Z" },
        },
        arrival: { airport: { iata: "OPO" } },
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const req = createMockRequest(
      "http://localhost/api/flights?num=TP123&date=2025-12-15"
    );
    await GET(req);

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ flightNumber: "TP123" }),
      expect.any(Object),
      expect.objectContaining({ upsert: true, new: true })
    );
  });

  it("should return API error status if API request fails", async () => {
    mockFindOne.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const req = createMockRequest(
      "http://localhost/api/flights?num=INVALID&date=2025-12-15"
    );
    const res = await GET(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch flight data");
  });

  it("should return 500 on internal server error", async () => {
    mockFindOne.mockResolvedValue(null);
    mockFetch.mockRejectedValue(new Error("Network error"));

    const req = createMockRequest(
      "http://localhost/api/flights?num=TP123&date=2025-12-15"
    );
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");
  });

  it("should handle cache lookup errors gracefully", async () => {
    mockFindOne.mockRejectedValue(new Error("DB error"));

    const apiResponse = [{ number: "TP123", status: "Scheduled" }];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const req = createMockRequest(
      "http://localhost/api/flights?num=TP123&date=2025-12-15"
    );
    const res = await GET(req);

    // Should fall through to API call
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("live");
  });

  it("should handle cache write errors gracefully", async () => {
    mockFindOne.mockResolvedValue(null);
    mockFindOneAndUpdate.mockRejectedValue(new Error("DB write error"));

    const apiResponse = [
      {
        number: "TP123",
        status: "Scheduled",
        departure: {
          airport: { iata: "LIS" },
          scheduledTime: { utc: "2025-12-15T08:00:00Z" },
        },
        arrival: { airport: { iata: "OPO" } },
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const req = createMockRequest(
      "http://localhost/api/flights?num=TP123&date=2025-12-15"
    );
    const res = await GET(req);

    // Should still return the API data
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("live");
  });

  it("should handle single flight response (non-array)", async () => {
    mockFindOne.mockResolvedValue(null);

    const apiResponse = {
      number: "TP123",
      status: "Scheduled",
      departure: {
        airport: { iata: "LIS" },
        scheduledTime: { utc: "2025-12-15T08:00:00Z" },
      },
      arrival: { airport: { iata: "OPO" } },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const req = createMockRequest(
      "http://localhost/api/flights?num=TP123&date=2025-12-15"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(apiResponse);
  });
});
