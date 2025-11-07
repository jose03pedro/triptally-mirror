import mongoose from 'mongoose';
import Trip from '@/app/models/Trip';

// Minimal smoke test that inserts a trip and checks the model/DB roundtrip.
// This test requires MONGO_URL to be set for the test environment.

describe('Trips smoke', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL as string);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    it('creates and reads a trip', async () => {
        const trip = await Trip.create({
            title: 'Smoke Test Trip',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            cities: [{ name: 'Testville', country: 'Testland' }],
            user: new mongoose.Types.ObjectId(),
        });

        const found = await Trip.findById(trip._id);
        expect(found).not.toBeNull();
        expect(found!.title).toBe('Smoke Test Trip');

        await Trip.deleteOne({ _id: trip._id });
    });
});
