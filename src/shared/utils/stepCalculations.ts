import { DailySteps } from '../../domain/entities/DailySteps';

/**
 * Auto-calculate distance in km based on steps (average stride length ~0.8m)
 */
export function calculateDistance(steps: number): number {
    return Number((steps * 0.0008).toFixed(2));
}

/**
 * Auto-calculate calories burned based on steps (average ~0.04 calories per step)
 */
export function calculateCalories(steps: number): number {
    return Math.round(steps * 0.04);
}

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgress(steps: number, goal: number): number {
    if (goal === 0) return 0;
    const progress = (steps / goal) * 100;
    return Number(progress.toFixed(2));
}

/**
 * Calculate current active streak (consecutive days with >= 1 step)
 * Array is assumed to be ordered DESC by date
 */
export function calculateStreak(history: DailySteps[], todayDate: Date): number {
    if (history.length === 0) return 0;

    let streak = 0;
    // We check backwards from today or yesterday
    // If today is 0 and yesterday is >0, streak is still active from yesterday

    // Normalize today to start of day for comparison
    const todayStr = todayDate.toISOString().split('T')[0];

    // Create a map of dates with steps > 0
    const activeDays = new Set<string>();
    for (const entry of history) {
        if (entry.steps > 0) {
            activeDays.add(entry.date.toISOString().split('T')[0]);
        }
    }

    // Start checking from today backwards
    const currentDate = new Date(todayDate);

    // Is today active?
    const todayIsActive = activeDays.has(todayStr);

    if (todayIsActive) {
        streak++;
    }

    // Check previous days consecutively
    for (let i = 1; i < history.length; i++) {
        currentDate.setDate(currentDate.getDate() - 1);
        const checkStr = currentDate.toISOString().split('T')[0];

        if (activeDays.has(checkStr)) {
            streak++;
        } else {
            // Once a day is missed (and it's not simply that today is missed but yesterday was active), 
            // the streak breaks.
            if (i === 1 && !todayIsActive) {
                // If today is missed but yesterday (i=1) is active, streak continues from yesterday.
                // It just hasn't extended to today yet.
                // Handled implicitly by the fact that if i=1 is missed, we hit this block and break.
            } else {
                break;
            }
        }
    }

    return streak;
}
