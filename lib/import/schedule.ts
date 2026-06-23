/**
 * Scheduling logic for remote feed pulls. Pure and side-effect free so the
 * "which feeds are due" decision is unit-testable independent of the cron and
 * the database.
 */

export type FeedSourceSchedule = {
  isActive: boolean;
  frequencyMinutes: number;
  lastRunAt: string | null;
};

/**
 * A feed is due when it is active and either has never run or its configured
 * interval has elapsed since the last run.
 */
export function isFeedSourceDue(source: FeedSourceSchedule, now: Date = new Date()): boolean {
  if (!source.isActive) return false;
  if (!source.lastRunAt) return true;

  const last = new Date(source.lastRunAt).getTime();
  if (!Number.isFinite(last)) return true;

  const intervalMs = Math.max(source.frequencyMinutes, 1) * 60_000;
  return now.getTime() - last >= intervalMs;
}

export function selectDueFeedSources<T extends FeedSourceSchedule>(sources: T[], now: Date = new Date()): T[] {
  return sources.filter((source) => isFeedSourceDue(source, now));
}
