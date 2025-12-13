import { Trip as TripType} from "@/types/trip/types";
import Trip from "@/app/models/Trip";

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

export async function updateTripSnapshot(
    tripId: string,
    newSnapshot: Record<string, any>
) {
    try {
        const trip = await Trip.findByIdAndUpdate(tripId, { lastWeatherSnapshot: newSnapshot }, { new: true });
        console.log(trip);

        return true;
    } catch (err) {
        console.error("Failed to update weather snapshot:", err);
        throw new Error("Could not update trip weather snapshot");
    }
}