export function formatMoney(amount: number) {
  return amount?.toFixed(2);
}

export async function convertMoney(
  amount: number,
  fromCurrency: string | undefined,
  toCurrency: string | undefined
) {
  if (!amount || !fromCurrency || !toCurrency) return null;

  if (fromCurrency === toCurrency) return amount;

  try {
    const res = await fetch(
      `/api/currencies/exchange-rates?toCurrency=${toCurrency}&fromCurrency=${fromCurrency}`
    );
    const data = await res.json();

    if (!data || !data.data || typeof data.data[toCurrency] !== "number") {
      console.warn("Invalid exchange API response:", data);
      return null;
    }

    const rate = data.data[toCurrency];
    if (!rate) return null;

    const converted = amount * rate;
    return formatMoney(converted);
  } catch (err) {
    console.error("Error getting conversion:", err);
    return null;
  }
}

// lib/utils/exchangeRates.ts
export async function getExchangeRates(
  baseCurrency: string,
  targetCurrencies: string[]
): Promise<Record<string, number>> {
  if (!baseCurrency || targetCurrencies.length === 0) return {};

  try {
    const apiKey = process.env.FREE_CURRENCY_API_KEY;
    const symbols = targetCurrencies.join(",");

    const res = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${symbols}&base_currency=${baseCurrency}`
    );

    const data = await res.json();

    if (!data || !data.data) {
      console.warn("Invalid exchange API response:", data);
      return {};
    }

    return data.data;
  } catch (err) {
    console.error("Error fetching exchange rates:", err);
    return {};
  }
}
