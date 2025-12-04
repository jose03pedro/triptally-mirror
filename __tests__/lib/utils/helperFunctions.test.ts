import { formatMoney, convertMoney, getExchangeRates } from "@/lib/utils/helperFunctions";

describe("helperFunctions", () => {
  describe("formatMoney", () => {
    it("formata número com 2 casas decimais", () => {
      expect(formatMoney(10)).toBe("10.00");
      expect(formatMoney(10.5)).toBe("10.50");
      expect(formatMoney(10.567)).toBe("10.57");
    });

    it("retorna undefined se amount for undefined", () => {
      expect(formatMoney(undefined as any)).toBeUndefined();
    });
  });

  describe("convertMoney", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn() as any;
    });

    afterEach(() => {
      global.fetch = originalFetch as any;
      jest.clearAllMocks();
    });

    it("retorna null se faltar algum parâmetro", async () => {
      expect(await convertMoney(100, undefined, "EUR")).toBeNull();
      expect(await convertMoney(100, "EUR", undefined)).toBeNull();
      expect(await convertMoney(0 as any, "EUR", "USD")).toBeNull();
    });

    it("se as moedas forem iguais, devolve o amount original", async () => {
      const result = await convertMoney(100, "EUR", "EUR");
      expect(result).toBe(100);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("usa API de exchange rates e formata o resultado", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            USD: 2, // 100 * 2 = 200 → "200.00"
          },
        }),
      });

      const result = await convertMoney(100, "EUR", "USD");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/currencies/exchange-rates?toCurrency=USD&fromCurrency=EUR"
      );
      expect(result).toBe("200.00");
    });

    it("retorna null se a API não devolver a moeda de destino", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            EUR: 1,
          },
        }),
      });

      const result = await convertMoney(100, "EUR", "USD");
      expect(result).toBeNull();
    });

    it("retorna null se a API falhar ou lançar erro", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
      const result = await convertMoney(100, "EUR", "USD");
      expect(result).toBeNull();
    });
  });

  describe("getExchangeRates", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn() as any;
    });

    afterEach(() => {
      global.fetch = originalFetch as any;
      jest.clearAllMocks();
    });

    it("devolve objeto com rates quando a API responde bem", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            USD: 1.1,
            GBP: 0.8,
          },
        }),
      });

      const result = await getExchangeRates("EUR", ["USD", "GBP"]);
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual({ USD: 1.1, GBP: 0.8 });
    });

    it("retorna {} se a resposta não tiver data válida", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await getExchangeRates("EUR", ["USD"]);
      expect(result).toEqual({});
    });

    it("retorna {} se a API lançar erro", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await getExchangeRates("EUR", ["USD"]);
      expect(result).toEqual({});
    });
  });
});
