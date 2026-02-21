import { DailySteps } from '../../domain/entities/DailySteps';

export function getTodayDate(): Date {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to midnight UTC
    return today;
}

export function isValidDateRange(start: Date, end: Date): boolean {
    return start <= end;
}

export function isFutureDate(date: Date): boolean {
    const today = getTodayDate();
    return date > today;
}

export function isDateTooOld(date: Date, maxDays: number = 7): boolean {
    const today = getTodayDate();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > maxDays;
}

export function getDaysInRange(start: Date, end: Date): Date[] {
    const arr: Date[] = [];
    // clone to avoid mutating input
    const current = new Date(start);
    while (current <= end) {
        arr.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return arr;
}

export function fillDateGaps(history: DailySteps[], start: Date, end: Date, userId: string = "unassigned"): DailySteps[] {
    const dates = getDaysInRange(start, end);
    const historyMap = new Map<string, DailySteps>();

    for (const entry of history) {
        const dateStr = entry.date.toISOString().split('T')[0];
        historyMap.set(dateStr, entry);
    }

    const filled: DailySteps[] = [];

    // Return in DESC order
    for (let i = dates.length - 1; i >= 0; i--) {
        const date = dates[i];
        const dateStr = date.toISOString().split('T')[0];

        if (historyMap.has(dateStr)) {
            filled.push(historyMap.get(dateStr)!);
        } else {
            // Fill missing with 0 steps
            filled.push({
                id: `gap-${dateStr}`,
                userId,
                date: date,
                steps: 0,
                distanceKm: 0,
                caloriesBurned: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    return filled;
}
