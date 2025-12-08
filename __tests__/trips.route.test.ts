import { GET } from '../app/api/trips/route';

jest.mock('@/lib/mongoose', () => jest.fn());

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => new Response(JSON.stringify(body), init)),
  },
}));

// Centralized mock for the Trip model
const mockTripFind = jest.fn();
const mockTripCountDocuments = jest.fn();

jest.mock('@/app/models/Trip', () => ({
  countDocuments: (query: any) => mockTripCountDocuments(query),
  find: (query: any) => mockTripFind(query),
}));

describe('GET /api/trips', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns total only when limit=0', async () => {
    mockTripCountDocuments.mockResolvedValue(42);
    const queryMock = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };
    mockTripFind.mockReturnValue(queryMock);

    const req = new Request('http://localhost/api/trips?limit=0', { method: 'GET' });
    const res = await GET(req as any);
    expect(res.status).toBe(200);

    const json = await (res as Response).json();
    expect(json.total).toBe(42);
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.items.length).toBe(0);
  });

  it('returns a paginated list of trips', async () => {
    const mockTrips = [
      { _id: '1', title: 'Trip to Paris' },
      { _id: '2', title: 'Trip to London' },
    ];
    mockTripCountDocuments.mockResolvedValue(20); // Total trips in DB

    const queryMock = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockTrips),
    };
    mockTripFind.mockReturnValue(queryMock);

    const req = new Request('http://localhost/api/trips?page=2&limit=10', { method: 'GET' });
    const res = await GET(req as any);
    const json = await (res as Response).json();

    expect(res.status).toBe(200);
    expect(json.total).toBe(20);
    expect(json.items).toEqual(mockTrips);
    expect(json.items.length).toBe(2);

    expect(mockTripFind).toHaveBeenCalledWith({ isPublic: true });
    expect(queryMock.sort).toHaveBeenCalledWith({ startDate: 1 });
    expect(queryMock.skip).toHaveBeenCalledWith(10); // (page 2 - 1) * limit 10
    expect(queryMock.limit).toHaveBeenCalledWith(10);
  });

  it('uses default pagination when no parameters are provided', async () => {
    const mockTrips = [{ _id: '1', title: 'Default Trip' }];
    mockTripCountDocuments.mockResolvedValue(1);
    const queryMock = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockTrips),
    };
    mockTripFind.mockReturnValue(queryMock);

    const req = new Request('http://localhost/api/trips', { method: 'GET' });
    await GET(req as any);

    expect(queryMock.skip).toHaveBeenCalledWith(0);
    expect(queryMock.limit).toHaveBeenCalledWith(12);
  });

  describe('with invalid query parameters', () => {
    it.each([
      ['page', 'abc'],
      ['limit', 'xyz'],
      ['page', '-1'],
      ['limit', '-5'],
    ])('returns a 400 error for invalid %s parameter', async (param, value) => {
      const req = new Request(`http://localhost/api/trips?${param}=${value}`, { method: 'GET' });
      const res = await GET(req as any);
      const json = await (res as Response).json();

      expect(res.status).toBe(400);
      expect(json.message).toBe('Invalid query parameters');
      expect(json.error).toBeDefined();
    });
  });
});
