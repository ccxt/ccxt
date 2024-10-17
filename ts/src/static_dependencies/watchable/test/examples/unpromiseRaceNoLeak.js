import { Unpromise } from "../../src";
const interruptPromise = new Promise((resolve) => {
  process.once("SIGINT", () => resolve("interrupted"));
});

async function run() {
  let count = 0;
  for (; ; count++) {
    const result = await Unpromise.race([
      new Promise((resolve) => {
        setImmediate(() => resolve("some_result"));
      }),
      interruptPromise,
    ]);
    if (result === "interrupted") {
      break;
    }
  }
  console.log(`Completed ${count} loops`);
}

run();
