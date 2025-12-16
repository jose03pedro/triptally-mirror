import {Trip as TripType, WeatherSnapshot} from "@/types/trip/types";
import Trip from "@/app/models/Trip";
import {WeatherDisplayData} from "@/types/weather/types";

export async function getTripsForNextDays(days: number): Promise<TripType[]> {
    const today = new Date();

    const next = new Date();
    next.setDate(today.getDate() + days);

    const trips : any = await Trip.find({
        startDate: { $lte: next }, // trip starts now or within days
        endDate: { $gte: today },  // trip is not finished
    })
        .select("_id title user startDate endDate cities lastWeatherSnapshot")
        .lean();

    return trips.map((t: { _id: { toString: () => any; }; title: any; user: any; startDate: any; endDate: any; cities: any; lastWeatherSnapshot: any; }) => ({
        _id: t._id.toString(),
        title: t.title,
        owner: t.user,
        startDate: t.startDate,
        endDate: t.endDate,
        cities: t.cities,
        lastWeatherSnapshot: t.lastWeatherSnapshot,
    }));
}

type DayWeather = WeatherDisplayData["days"][number];

export function mergeDaysByDate(
    prev: DayWeather[] = [],
    next: DayWeather[] = []
): DayWeather[] {
    const map = new Map<string, DayWeather>();

    // Keep previous days
    for (const day of prev) {
        map.set(day.date, day);
    }

    // Override with new forecast days
    for (const day of next) {
        map.set(day.date, day);
    }

    // Return sorted by date
    return Array.from(map.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}


export function isDateWithinTrip(
    date: string,
    startDate: string,
    endDate: string
) {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return d >= start && d <= end;
}

export async function updateTripSnapshot(
    tripId: string,
    newSnapshot: WeatherSnapshot
) {
    try {
        await Trip.findByIdAndUpdate(
            tripId,
            { lastWeatherSnapshot: newSnapshot },
            { new: true }
        );

        return true;
    } catch (err) {
        console.error("Failed to update weather snapshot:", err);
        throw new Error("Could not update trip weather snapshot");
    }
}