import mongoose from 'mongoose';
import Trip from '@/app/models/Trip';

// Minimal smoke test that inserts a trip and checks the model/DB roundtrip.
// This test requires MONGO_URL to be set for the test environment.

describe('Trips smoke', () => {
    beforeAll(async () => {
        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL environment variable is not set');
        }
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await Trip.deleteMany({});
    });

    it('creates and reads a trip', async () => {
        const trip = await Trip.create({
            title: 'Smoke Test Trip',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            cities: [{ name: 'Testville', country: 'Testland' }],
            user: new mongoose.Types.ObjectId(),
            isPublic: true,
        });

        const found = await Trip.findById(trip._id);
        expect(found).not.toBeNull();
        expect(found!.title).toBe('Smoke Test Trip');
    });
});