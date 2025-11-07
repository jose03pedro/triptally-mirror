export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const namePrefix = (searchParams.get("namePrefix") || "").toLowerCase();

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

    const filtered = staticCities.filter((c) => c.name.toLowerCase().startsWith(namePrefix));

    // ensure unique city names (defensive)
    const unique = Array.from(
        filtered.reduce((map, city) => {
            if (!map.has(city.name)) map.set(city.name, city);
            return map;
        }, new Map()).values()
    );

    return Response.json(unique);
}