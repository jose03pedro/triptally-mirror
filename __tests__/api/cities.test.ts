import { GET as getCities } from "@/app/api/cities/route";

describe("GET /api/cities", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });
});
