/**
 * @typedef {Object} City
 * @property {number} id
 * @property {string} name
 * @property {string} country
 */

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const namePrefix = searchParams.get("namePrefix") || "";

    const url = `https://${process.env.GEODB_API_HOST}/v1/geo/cities?namePrefix=${namePrefix}&type=CITY&limit=10`;

    const res = await fetch(url, {
        headers: {
            "X-RapidAPI-Key": process.env.GEODB_API_KEY,
            "X-RapidAPI-Host": process.env.GEODB_API_HOST,
        },
    });

    if (!res.ok) {
        console.error("GeoDB API error:", res.status, await res.text());
        return Response.json({ error: "Failed to fetch cities" }, { status: res.status });
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.data)) {
        console.error("Unexpected GeoDB response:", data);
        return Response.json({ error: "Invalid response from GeoDB" }, { status: 500 });
    }

    const formatted = data.data.map((city) => ({
        id: city.id,
        name: city.city,
        country: city.country,
    }));

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