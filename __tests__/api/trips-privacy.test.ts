import { GET as getTrip } from "@/app/api/trips/[id]/route";
import { GET as getTripExpenses } from "@/app/api/trips/[id]/expenses/route";
import Trip from "@/app/models/Trip";
import Expense from "@/app/models/Expense";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getExchangeRates } from "@/lib/utils/helperFunctions";

// Mocks de módulos usados pelos routes
jest.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/app/models/Trip", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock("@/app/models/Expense", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

jest.mock("@/app/models/ExpenseCategory", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/app/models/Currency", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/lib/auth/getCurrentUser", () => ({
  __esModule: true,
  getCurrentUser: jest.fn(),
  // also provide a default export in case implementation imports the default
  default: jest.fn(),
  jest.mock("@/lib/utils/helperFunctions", () => ({
    __esModule: true,
    getExchangeRates: jest.fn(),
    // also provide a default export in case implementation imports the default
    default: jest.fn(),
  }));
  getExchangeRates: jest.fn(),
}));

const mockedTrip = Trip as unknown as {
  findById: jest.Mock;
};

const mockedExpense = Expense as unknown as {
  find: jest.Mock;
};
// helper para simular um Query do mongoose com .populate() e que é awaitable
function makePopulateQuery<T>(doc: T) {
  return {
    populate: jest.fn().mockReturnThis(),
    // support both .exec() and direct await of the query (thenable)
    exec: jest.fn().mockResolvedValue(doc),
    then: (resolve: (d: T) => void, reject?: (e: any) => void) => {
      try {
        resolve(doc);
      } catch (e) {
        if (reject) reject(e);
      }
    },
    catch: jest.fn(),
  };
}
populate: jest.fn().mockReturnThis(),
  then: (resolve: (d: T) => void) => resolve(doc),
  };
}

describe("Trip privacy – GET /api/trips/[id]", () => {
  const baseTrip: any = {
    _id: "trip1",
    title: "Summer trip",
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-07-10"),
    isPublic: true,
    privacy: {},
    cities: [],
    coverImage: null,
    currency: { code: "EUR" },
    user: { _id: "owner123", first_name: "Owner", last_name: "User" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 404 when trip does not exist", async () => {
    mockedTrip.findById.mockReturnValue(makePopulateQuery(null));

    const req = new Request("http://localhost:3000/api/trips/trip1");

    const res = await getTrip(req, {
      params: Promise.resolve({ id: "trip1" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Trip not found");
  });

  test("blocks access to private trip for non-owner (403)", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "otherUser" });

    const privateTrip = { ...baseTrip, isPublic: false };

    mockedTrip.findById.mockReturnValue(makePopulateQuery(privateTrip));

    const req = new Request("http://localhost:3000/api/trips/trip1");

    const res = await getTrip(req, {
      params: Promise.resolve({ id: "trip1" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("This trip is private");
  });

  test("allows owner to access private trip", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "owner123" });

    const privateTrip = { ...baseTrip, isPublic: false };

    mockedTrip.findById.mockReturnValue(makePopulateQuery(privateTrip));

    const req = new Request("http://localhost:3000/api/trips/trip1");

    const res = await getTrip(req, {
      params: Promise.resolve({ id: "trip1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body._id).toBe("trip1");
    expect(body.isPublic).toBe(false);
    expect(body.owner._id).toBe("owner123");
  });

  test("allows non-owner to access public trip", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "otherUser" });

    const publicTrip = { ...baseTrip, isPublic: true };

    mockedTrip.findById.mockReturnValue(makePopulateQuery(publicTrip));

    const req = new Request("http://localhost:3000/api/trips/trip1");

    const res = await getTrip(req, {
      params: Promise.resolve({ id: "trip1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body._id).toBe("trip1");
    expect(body.isPublic).toBe(true);
  });
});

describe("Trip privacy – GET /api/trips/[id]/expenses", () => {
  const baseTrip: any = {
    _id: "trip1",
    isPublic: false,
    privacy: { showExpenses: true },
    currency: { code: "EUR" },
    user: "owner123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedTrip.findById.mockReturnValue(makePopulateQuery(baseTrip));
    mockedGetExchangeRates.mockResolvedValue({}); // não interessa aqui
  });

  test("blocks expenses for private trip when user is not owner (403)", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "otherUser" });

    const req = new Request(
      "http://localhost:3000/api/trips/trip1/expenses"
    );

    const res = await getTripExpenses(req, {
      params: Promise.resolve({ id: "trip1" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("This trip is private");

    expect(mockedExpense.find).not.toHaveBeenCalled();
  });

  test("returns expenses for owner even if trip is private", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "owner123" });

    const docs = [
      {
        toObject: () => ({
          _id: "exp1",
          value: 100,
          currency: { code: "EUR" },
        }),
      },
    ];

    mockedExpense.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: (resolve: (d: any) => void) => resolve(docs),
    });

    const req = new Request(
      "http://localhost:3000/api/trips/trip1/expenses"
    );

    const res = await getTripExpenses(req, {
      params: Promise.resolve({ id: "trip1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.expenses).toHaveLength(1);
    expect(body.expenses[0]._id).toBe("exp1");
    // se a tua lógica de conversão mantiver 100 para EUR→EUR
    expect(body.expenses[0].convertedValue).toBe(100);
  });

  test("hides expenses for non-owner when showExpenses = false", async () => {
    // trip público mas com showExpenses = false
    mockedTrip.findById.mockReturnValue(
      makePopulateQuery({
        ...baseTrip,
        isPublic: true,
        privacy: { showExpenses: false },
      })
    );

    mockedGetCurrentUser.mockResolvedValue({ id: "visitor" });

    const req = new Request(
      "http://localhost:3000/api/trips/trip1/expenses"
    );

    const res = await getTripExpenses(req, {
      params: Promise.resolve({ id: "trip1" }),
    });

    // aqui assumo que implementas como: 200 com expenses = []
    // se preferires 403, muda o expect
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.expenses).toEqual([]);
  });
});
