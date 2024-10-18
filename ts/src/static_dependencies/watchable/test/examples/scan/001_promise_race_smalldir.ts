/* eslint-disable @typescript-eslint/promise-function-async */
import { promises } from "fs";
const { readdir } = promises;

/** Stays unsettled until SIGINT or SIGTERM */
const terminationPromise = new Promise<"terminated">((resolve) => {
  const terminationListener = () => {
    resolve("terminated");
  };
  process.once("SIGINT", terminationListener); // interrupt by user
  process.once("SIGTERM", terminationListener); // shutdown by system
});

async function run() {
  let totalScans = 0;
  let totalViruses = 0;
  try {
    while (true) {
      const readResult = await Promise.race([
        readdir("./test/examples/scanned/smalldir"),
        terminationPromise,
      ]);
      if (readResult === "terminated") {
        break;
      }
      const viruses = readResult.filter((name) => name.match(/virus/) !== null);
      console.log(
        `Scan #${totalScans} ${readResult.length} files ${viruses.length} viruses`
      );
      totalScans++;
      totalViruses += viruses.length;
      await sleep(100);
    }
  } finally {
    console.log( `\nShutdown! \nScans: ${totalScans}. Viruses: ${totalViruses}` );
  }
}

function sleep(ms: number) { 
  return new Promise((resolve) => setTimeout(resolve, ms)); 
}

void run();