/**
 * @typedef {Object} City
 * @property {number} id
 * @property {string} name
 * @property {string} country
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const namePrefix = (searchParams.get("namePrefix") || "").toLowerCase();

  const GEODB_API_KEY = process.env.GEODB_API_KEY;
  const GEODB_API_HOST = process.env.GEODB_API_HOST;

  const staticCities = [
    { id: "1", name: "Budapest", country: "Hungary" },
    { id: "2", name: "London", country: "United Kingdom" },
    { id: "3", name: "New York City", country: "USA" },
    { id: "4", name: "Paris", country: "France" },
    { id: "5", name: "Tokyo", country: "Japan" },
    { id: "6", name: "Berlin", country: "Germany" },
    { id: "7", name: "Barcelona", country: "Spain" },
    { id: "8", name: "Lisbon", country: "Portugal" },
    { id: "9", name: "Prague", country: "Czechia" },
    { id: "10", name: "Amsterdam", country: "Netherlands" },
    { id: "11", name: "Melbourne", country: "Australia" },
  ];

  let cities = staticCities.filter((c) =>
    c.name.toLowerCase().startsWith(namePrefix)
  );

  if (!GEODB_API_KEY || !GEODB_API_HOST) {
    return Response.json(cities);
  }

  const url = `https://${GEODB_API_HOST}/v1/geo/cities?namePrefix=${namePrefix}&type=CITY&limit=10`;

  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": GEODB_API_KEY,
      "X-RapidAPI-Host": GEODB_API_HOST,
    },
  });

  if (!res.ok) {
    console.error("GeoDB API error:", res.status, await res.text());
  } else {
    const data = await res.json();

    if (!data || !Array.isArray(data.data)) {
      console.error("Unexpected GeoDB response:", data);
    } else {
      cities = data.data.map((city: any) => ({
        id: city.id,
        name: city.city,
        country: city.country,
      }));
    }
  }

  // Remove duplicates by city name
  const unique = Array.from(
    cities
      .reduce((map, city) => {
        if (!map.has(city.name)) map.set(city.name, city);
        return map;
      }, new Map())
      .values()
  );

  return Response.json(unique);
}
