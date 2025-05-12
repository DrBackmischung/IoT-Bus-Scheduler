export function travelTime(distance, speed) {
    if (!Number.isFinite(speed) || speed <= 0) {
        console.warn(`⚠️ Invalid speed in travelTime():`, { distance, speed });
        return 0;
    }
    return (distance / speed) * 60;
}
  
export function arrivalTime(prevTime, distance, speed) {
    if (!Number.isFinite(prevTime) || !Number.isFinite(distance) || !Number.isFinite(speed)) {
        console.warn(`⚠️ Invalid input to arrivalTime():`, { prevTime, distance, speed });
        return NaN;
    }
    return prevTime + travelTime(distance, speed);
}
  
  
export function alightingPassengers(onboard, exit) {
    return Math.min(onboard, exit);
}
  
export function boardingPassengers(enter, capacityLeft) {
    return Math.min(enter, capacityLeft);
}