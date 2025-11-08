import connectionToDB from "@/lib/mongoose";
import Trip from "@/app/models/Trip";

export async function GET() {
    await connectionToDB();
    const items = await Trip.find({}).sort({ createdAt: -1 }).limit(10);
    return new Response(JSON.stringify({ items }), {
        headers: { "Content-Type": "application/json" },
    });
}
