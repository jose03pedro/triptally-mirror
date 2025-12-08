import { GET as getExchangeRatesRoute } from "@/app/api/currencies/exchange-rates/route";

describe("GET /api/currencies/exchange-rates", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv, FREE_CURRENCY_API_KEY: "test_key" };
    global.fetch = jest.fn() as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch as any;
    jest.clearAllMocks();
  });

  it("chama a API externa com os parâmetros corretos e devolve o json", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ data: { USD: 1.1 } }),
    });

    const req = new Request(
      "http://localhost/api/currencies/exchange-rates?fromCurrency=EUR&toCurrency=USD"
    );

    const res = await getExchangeRatesRoute(req);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("https://");
    expect(calledUrl).toContain("apikey=test_key");
    expect(calledUrl).toContain("currencies=USD");
    expect(calledUrl).toContain("base_currency=EUR");

    const body = await res.json();
    expect(body).toEqual({ data: { USD: 1.1 } });
  });
});
