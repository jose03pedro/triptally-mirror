import { NextRequest, NextResponse } from "next/server";

// Google Places API endpoint for autocomplete
const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const GOOGLE_PLACES_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const placeId = searchParams.get("placeId");

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  // If placeId is provided, fetch place details
  if (placeId) {
    try {
      const url = new URL(GOOGLE_PLACES_DETAILS_URL);
      url.searchParams.set("place_id", placeId);
      url.searchParams.set("key", apiKey);
      url.searchParams.set(
        "fields",
        "place_id,name,formatted_address,geometry,types,rating,opening_hours,website,formatted_phone_number"
      );

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.status !== "OK") {
        return NextResponse.json(
          { error: data.error_message || "Failed to fetch place details" },
          { status: 400 }
        );
      }

      const place = data.result;
      return NextResponse.json({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coordinates: place.geometry?.location
          ? {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            }
          : undefined,
        types: place.types || [],
        rating: place.rating,
        openingHours: place.opening_hours?.weekday_text,
        website: place.website,
        phoneNumber: place.formatted_phone_number,
      });
    } catch (error) {
      console.error("Place details error:", error);
      return NextResponse.json(
        { error: "Failed to fetch place details" },
        { status: 500 }
      );
    }
  }

  // Otherwise, perform autocomplete search
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const url = new URL(GOOGLE_PLACES_AUTOCOMPLETE_URL);
    url.searchParams.set("input", query);
    url.searchParams.set("key", apiKey);
    // Use 'establishment' type to get businesses, restaurants, attractions etc.
    url.searchParams.set("types", "establishment");

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places API error:", data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message || `Places API error: ${data.status}` },
        { status: 400 }
      );
    }

    const predictions = (data.predictions || []).map((p: any) => ({
      placeId: p.place_id,
      name: p.structured_formatting?.main_text || p.description,
      address: p.structured_formatting?.secondary_text || "",
      types: p.types || [],
    }));

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Places autocomplete error:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}
