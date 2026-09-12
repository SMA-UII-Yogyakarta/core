import { describe, expect, it } from "vitest";
import { calculateDistance, formatDistance, isWithinSchoolGeofence } from "../../utils/geoHelper";

const TEST_SCHOOL_LOCATION = {
    latitude: -7.814257,
    longitude: 110.375944,
    maxRadiusMeters: 100,
};

describe("Geo Helper Utility", () => {
    it("returns zero distance for exact school coordinates", () => {
        const distance = calculateDistance(
            TEST_SCHOOL_LOCATION.latitude,
            TEST_SCHOOL_LOCATION.longitude,
            TEST_SCHOOL_LOCATION.latitude,
            TEST_SCHOOL_LOCATION.longitude,
        );
        expect(distance).toBe(0);
        expect(
            isWithinSchoolGeofence(
                TEST_SCHOOL_LOCATION.latitude,
                TEST_SCHOOL_LOCATION.longitude,
                TEST_SCHOOL_LOCATION.maxRadiusMeters,
                TEST_SCHOOL_LOCATION.latitude,
                TEST_SCHOOL_LOCATION.longitude,
            ),
        ).toBe(true);
    });

    it("identifies location within 100 meters geofence", () => {
        // Point approximately 15 meters away from SMA UII
        const nearbyLat = TEST_SCHOOL_LOCATION.latitude - 0.0001;
        const nearbyLng = TEST_SCHOOL_LOCATION.longitude + 0.0001;
        const distance = calculateDistance(
            nearbyLat,
            nearbyLng,
            TEST_SCHOOL_LOCATION.latitude,
            TEST_SCHOOL_LOCATION.longitude,
        );

        expect(distance).toBeLessThan(100);
        expect(
            isWithinSchoolGeofence(
                nearbyLat,
                nearbyLng,
                TEST_SCHOOL_LOCATION.maxRadiusMeters,
                TEST_SCHOOL_LOCATION.latitude,
                TEST_SCHOOL_LOCATION.longitude,
            ),
        ).toBe(true);
    });

    it("identifies location outside geofence", () => {
        // Point in Malioboro / Tugu (~4.5 km away)
        const tuguLat = -7.782884;
        const tuguLng = 110.367093;
        const distance = calculateDistance(
            tuguLat,
            tuguLng,
            TEST_SCHOOL_LOCATION.latitude,
            TEST_SCHOOL_LOCATION.longitude,
        );

        expect(distance).toBeGreaterThan(1000);
        expect(
            isWithinSchoolGeofence(
                tuguLat,
                tuguLng,
                TEST_SCHOOL_LOCATION.maxRadiusMeters,
                TEST_SCHOOL_LOCATION.latitude,
                TEST_SCHOOL_LOCATION.longitude,
            ),
        ).toBe(false);
    });

    it("formats distances correctly in meters and kilometers", () => {
        expect(formatDistance(45)).toBe("45 meter");
        expect(formatDistance(950)).toBe("950 meter");
        expect(formatDistance(1500)).toBe("1.5 km");
        expect(formatDistance(3200)).toBe("3.2 km");
    });
});
