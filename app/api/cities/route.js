/**
 * @typedef {Object} City
 * @property {number} id
 * @property {string} name
 * @property {string} country
 */

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const namePrefix = searchParams.get("namePrefix") || "";
    // If GeoDB environment variables are not configured (e.g., locally),
    // return a small static fallback list so the UI still works.
    const GEODB_HOST = process.env.GEODB_API_HOST;
    const GEODB_KEY = process.env.GEODB_API_KEY;

    // For local development and simplicity, use a static in-repo list of
    // popular cities. Custom free-text entries are handled on the client.
    const staticCities = [
        { id: "1", name: "Budapest", country: "Hungary" },
        { id: "2", name: "London", country: "United Kingdom" },
        { id: "3", name: "New York", country: "USA" },
        { id: "4", name: "Paris", country: "France" },
        { id: "5", name: "Tokyo", country: "Japan" },
        { id: "6", name: "Berlin", country: "Germany" },
        { id: "7", name: "Barcelona", country: "Spain" },
        { id: "8", name: "Lisbon", country: "Portugal" },
        { id: "9", name: "Prague", country: "Czechia" },
        { id: "10", name: "Amsterdam", country: "Netherlands" },
    ];

    const filtered = staticCities.filter((c) =>
        c.name.toLowerCase().startsWith(namePrefix.toLowerCase())
    );

    return Response.json(filtered);

    // Remove duplicates by city name
    const uniqueCitiesMap = new Map();
    formatted.forEach((city) => {
        if (!uniqueCitiesMap.has(city.name)) {
            uniqueCitiesMap.set(city.name, city);
        }
    });

    const uniqueCities = Array.from(uniqueCitiesMap.values());

    return Response.json(uniqueCities);
}