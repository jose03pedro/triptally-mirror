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

  it("retorna apenas cidades estáticas quando GEODB env vars não existem", async () => {
    delete process.env.GEODB_API_KEY;
    delete process.env.GEODB_API_HOST;

    const req = new Request("http://localhost/api/cities?namePrefix=Lis");
    const res = await getCities(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body)).toBe(true);
    // Deve conter Lisboa, pelo prefixo 'Lis'
    const names = body.map((c: any) => c.name);
    expect(names).toContain("Lisbon");
  });

  it("faz filtro case-insensitive por namePrefix", async () => {
    const req = new Request("http://localhost/api/cities?namePrefix=par");
    const res = await getCities(req);

    const body = await res.json();
    const names = body.map((c: any) => c.name);
    expect(names).toContain("Paris");
  });
});
