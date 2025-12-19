// Mock the mongoose connection
jest.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

// Mock getCurrentUser
const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth/getCurrentUser", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Mock functions for Trip model
const mockFindById = jest.fn();
const mockSave = jest.fn();

// Mock the Trip model
jest.mock("@/app/models/Trip", () => {
  return {
    __esModule: true,
    default: {
      findById: (...args: any[]) => {
        const result = mockFindById(...args);
        // Return a promise-like object that also has select/lean methods
        const chainable = {
          select: (fields: string) => ({
            lean: () => Promise.resolve(result),
            then: (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject),
          }),
          lean: () => Promise.resolve(result),
          then: (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject),
        };
        return chainable;
      },
    },
  };
});

import { GET, POST, PUT, DELETE } from "@/app/api/trips/[id]/locations/route";
import { NextRequest } from "next/server";

// Helper to create mock request
function createMockRequest(
  url: string,
  method: string = "GET",
  body?: any
): NextRequest {
  const urlObj = new URL(url);
  return {
    nextUrl: urlObj,
    method,
    json: () => Promise.resolve(body),
  } as any;
}

// Helper to create context with params
function createContext(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

describe("GET /api/trips/[id]/locations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if trip ID is missing", async () => {
    const req = createMockRequest("http://localhost/api/trips//locations");
    const context = createContext("");

    const res = await GET(req, context);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Trip ID is required");
  });

  it("should return 404 if trip not found", async () => {
    mockFindById.mockReturnValue({
      select: () => ({
        ...null,
      }),
    });
    mockFindById.mockResolvedValue(null);

    const req = createMockRequest("http://localhost/api/trips/123/locations");
    const context = createContext("123");

    const res = await GET(req, context);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("Trip not found");
  });

  it("should return 403 for private trip when user is not owner", async () => {
    const mockTrip = {
      _id: "trip-123",
      user: "owner-456",
      isPublic: false,
      mustVisitLocations: [],
    };

    mockFindById.mockReturnValue({
      select: () => mockTrip,
    });
    mockGetCurrentUser.mockResolvedValue({ id: "other-user-789" });

    const req = createMockRequest("http://localhost/api/trips/trip-123/locations");
    const context = createContext("trip-123");

    const res = await GET(req, context);
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toBe("Access denied");
  });

  it("should return locations for public trip", async () => {
    const mockLocations = [
      {
        _id: { toString: () => "loc-1" },
        name: "Eiffel Tower",
        category: "attraction",
        priority: 1,
        toObject: function () {
          return { ...this, _id: "loc-1" };
        },
      },
    ];

    const mockTrip = {
      _id: "trip-123",
      user: "owner-456",
      isPublic: true,
      mustVisitLocations: mockLocations,
    };

    mockFindById.mockReturnValue(mockTrip);
    mockGetCurrentUser.mockResolvedValue(null);

    const req = createMockRequest("http://localhost/api/trips/trip-123/locations");
    const context = createContext("trip-123");

    const res = await GET(req, context);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].name).toBe("Eiffel Tower");
  });

  it("should return locations for owner of private trip", async () => {
    const mockLocations = [
      {
        _id: { toString: () => "loc-1" },
        name: "Secret Restaurant",
        category: "restaurant",
        priority: 2,
        toObject: function () {
          return { ...this, _id: "loc-1" };
        },
      },
    ];

    const mockTrip = {
      _id: "trip-123",
      user: "owner-456",
      isPublic: false,
      mustVisitLocations: mockLocations,
    };

    mockFindById.mockReturnValue(mockTrip);
    mockGetCurrentUser.mockResolvedValue({ id: "owner-456" });

    const req = createMockRequest("http://localhost/api/trips/trip-123/locations");
    const context = createContext("trip-123");

    const res = await GET(req, context);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body[0].name).toBe("Secret Restaurant");
  });
});

describe("POST /api/trips/[id]/locations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "POST",
      { name: "Test Location" }
    );
    const context = createContext("trip-123");

    const res = await POST(req, context);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 404 if trip not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "user-123" });
    mockFindById.mockResolvedValue(null);

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "POST",
      { name: "Test Location" }
    );
    const context = createContext("trip-123");

    const res = await POST(req, context);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("Trip not found");
  });

  it("should return 403 if user is not trip owner", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "other-user" });
    mockFindById.mockResolvedValue({
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [],
      save: mockSave,
    });

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "POST",
      { name: "Test Location" }
    );
    const context = createContext("trip-123");

    const res = await POST(req, context);
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toBe("Access denied");
  });

  it("should return 400 if name is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "owner-456" });
    mockFindById.mockResolvedValue({
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [],
      save: mockSave,
    });

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "POST",
      { category: "restaurant" }
    );
    const context = createContext("trip-123");

    const res = await POST(req, context);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Location name is required");
  });

  it("should return 400 if name is empty", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "owner-456" });
    mockFindById.mockResolvedValue({
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [],
      save: mockSave,
    });

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "POST",
      { name: "   " }
    );
    const context = createContext("trip-123");

    const res = await POST(req, context);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Location name is required");
  });
});

describe("PUT /api/trips/[id]/locations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "PUT",
      { locationId: "loc-1", notes: "Updated" }
    );
    const context = createContext("trip-123");

    const res = await PUT(req, context);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 400 if locationId is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "owner-456" });
    mockFindById.mockResolvedValue({
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [],
      save: mockSave,
    });

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "PUT",
      { notes: "Updated" }
    );
    const context = createContext("trip-123");

    const res = await PUT(req, context);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Location ID is required");
  });

  it("should return 404 if location not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "owner-456" });
    mockFindById.mockResolvedValue({
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [
        { _id: "other-loc", name: "Other Place" },
      ],
      save: mockSave,
    });

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "PUT",
      { locationId: "non-existent", notes: "Updated" }
    );
    const context = createContext("trip-123");

    const res = await PUT(req, context);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("Location not found");
  });
});

describe("DELETE /api/trips/[id]/locations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "DELETE",
      { locationId: "loc-1" }
    );
    const context = createContext("trip-123");

    const res = await DELETE(req, context);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 403 if user is not trip owner", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "other-user" });
    mockFindById.mockResolvedValue({
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [],
      save: mockSave,
    });

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "DELETE",
      { locationId: "loc-1" }
    );
    const context = createContext("trip-123");

    const res = await DELETE(req, context);
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toBe("Access denied");
  });

  it("should return 400 if locationId is missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "owner-456" });
    mockFindById.mockResolvedValue({
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [],
      save: mockSave,
    });

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "DELETE",
      {}
    );
    const context = createContext("trip-123");

    const res = await DELETE(req, context);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Location ID is required");
  });

  it("should return 404 if location not found", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "owner-456" });
    mockFindById.mockResolvedValue({
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [
        { _id: "other-loc", name: "Other Place" },
      ],
      save: mockSave,
    });

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "DELETE",
      { locationId: "non-existent" }
    );
    const context = createContext("trip-123");

    const res = await DELETE(req, context);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("Location not found");
  });

  it("should successfully delete a location", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "owner-456" });

    const mockTrip = {
      _id: "trip-123",
      user: "owner-456",
      mustVisitLocations: [
        { _id: "loc-1", name: "Location 1" },
        { _id: "loc-2", name: "Location 2" },
      ],
      save: mockSave,
    };
    mockFindById.mockResolvedValue(mockTrip);
    mockSave.mockResolvedValue(mockTrip);

    const req = createMockRequest(
      "http://localhost/api/trips/trip-123/locations",
      "DELETE",
      { locationId: "loc-1" }
    );
    const context = createContext("trip-123");

    const res = await DELETE(req, context);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockSave).toHaveBeenCalled();
  });
});
