/**
 * Local cron runner — mirrors /api/cron without HTTP.
 * Usage: npm run cron:all
 */
import { syncLiveJobs } from "../src/lib/jobs/ingest";
import { processQueuedApplications } from "../src/lib/auto-apply/queue";
import { runFollowUpReminders, runJobAlerts } from "../src/lib/alerts";

async function main() {
  console.log("sync-jobs…");
  console.log(await syncLiveJobs({ perBoard: 8, arbeitnow: false }));
  console.log("process-queue…");
  console.log(await processQueuedApplications(40));
  console.log("job-alerts…");
  console.log(await runJobAlerts());
  console.log("follow-ups…");
  console.log(await runFollowUpReminders());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
