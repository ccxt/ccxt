const interruptPromise = new Promise((resolve) => {
  process.once("SIGINT", () => resolve("interrupted"));
});

async function run() {
  let count = 0;
  for (; ; count++) {
    const taskPromise = new Promise((resolve) => {
      setImmediate(() => resolve("task_result"));
    });
    const result = await Promise.race([taskPromise, interruptPromise]);
    if (result === "interrupted") {
      break;
    }
    console.log(`Completed ${count} task loops`);
  }
}

run();
