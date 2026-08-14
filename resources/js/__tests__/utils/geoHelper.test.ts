import { describe, expect, it } from "vitest";
import {
    calculateDistance,
    formatDistance,
    isWithinSchoolGeofence,
    SMA_UII_LOCATION,
} from "../../utils/geoHelper";

describe("Geo Helper Utility", () => {
    it("returns zero distance for exact school coordinates", () => {
        const distance = calculateDistance(
            SMA_UII_LOCATION.latitude,
            SMA_UII_LOCATION.longitude,
        );
        expect(distance).toBe(0);
        expect(
            isWithinSchoolGeofence(
                SMA_UII_LOCATION.latitude,
                SMA_UII_LOCATION.longitude,
            ),
        ).toBe(true);
    });

    it("identifies location within 100 meters geofence", () => {
        // Point approximately 40 meters away
        const nearbyLat = -7.797200;
        const nearbyLng = 110.399650;
        const distance = calculateDistance(nearbyLat, nearbyLng);

        expect(distance).toBeLessThan(100);
        expect(isWithinSchoolGeofence(nearbyLat, nearbyLng)).toBe(true);
    });

    it("identifies location outside geofence", () => {
        // Point in Malioboro / Tugu (~4.5 km away)
        const tuguLat = -7.782884;
        const tuguLng = 110.367093;
        const distance = calculateDistance(tuguLat, tuguLng);

        expect(distance).toBeGreaterThan(1000);
        expect(isWithinSchoolGeofence(tuguLat, tuguLng)).toBe(false);
    });

    it("formats distances correctly in meters and kilometers", () => {
        expect(formatDistance(45)).toBe("45 meter");
        expect(formatDistance(950)).toBe("950 meter");
        expect(formatDistance(1500)).toBe("1.5 km");
        expect(formatDistance(3200)).toBe("3.2 km");
    });
});
