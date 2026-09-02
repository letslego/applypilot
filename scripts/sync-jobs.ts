import { syncLiveJobs } from "../src/lib/jobs/ingest";

async function main() {
  const quick = process.argv.includes("--quick");
  console.log(`Syncing live jobs${quick ? " (quick)" : ""}…`);
  const summary = await syncLiveJobs(
    quick
      ? {
          perBoard: 8,
          greenhouseTokens: ["stripe", "airbnb", "figma", "vercel", "anthropic"],
          arbeitnow: false,
        }
      : { perBoard: 15 },
  );
  console.log(JSON.stringify(summary, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
