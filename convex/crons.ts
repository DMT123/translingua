import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "expire stale translations",
  { minutes: 5 },
  internal.translations.expireStale
);

crons.daily(
  "daily storage snapshot",
  { hourUTC: 0, minuteUTC: 0 },
  internal.storageSnapshots.dailySnapshotAll
);

crons.interval(
  "retry failed emails",
  { minutes: 10 },
  internal.emailEvents.retryFailed
);

crons.daily(
  "purge expired documents",
  { hourUTC: 1, minuteUTC: 0 },
  internal.documents.autoPurge
);

export default crons;
