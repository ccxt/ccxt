import { Throttler } from "../../base/functions/customThrottle.js";
import { assert } from "node:console";

const tests = [
  {
    name: "Priority test for customThrottle",
    test: customThrottlePriorityTest,
  },
];

const getRequestsParameters = (priority?: number) => {
  return {
    cost: 1,
    path: "test",
    customPriority: priority,
    customExpireInterval: 1000 * 10,
  };
};

// Priority test for customThrottle
async function customThrottlePriorityTest() {
  const throttler: Throttler = new Throttler({});

  const requestParameters = [
    getRequestsParameters(2), // 0
    getRequestsParameters(2), // 1
    getRequestsParameters(3), // 2
    getRequestsParameters(1), // 3
    getRequestsParameters(1), // 4
    getRequestsParameters(), // 5 (default priority is 2)
    getRequestsParameters(3), // 6
    getRequestsParameters(1), // 7
  ];
  const result = [];

  let i = 0;
  const requests = requestParameters.map((requestParameter) => {
    const { cost, path, customPriority, customExpireInterval } =
      requestParameter;
    const promise = throttler.customThrottle(
      cost,
      path,
      customExpireInterval,
      customPriority
    );
    const j = i++;
    promise.then(async () => {
      result.push(j);
    });
  });

  while (result.length < requests.length) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }

  assert(result[0] === 0, "result[0] === 0");
  assert(result[1] === 3, "result[1] === 3");
  assert(result[2] === 4, "result[2] === 4");
  assert(result[3] === 7, "result[3] === 7");
  assert(result[4] === 1, "result[4] === 1");
  assert(result[5] === 5, "result[5] === 5");
  assert(result[6] === 2, "result[6] === 2");
  assert(result[7] === 6, "result[7] === 6");
}

const runTest = async () => {
  const maxNameLength = Math.max(...tests.map((test) => test.name.length));

  console.log("Running tests. If nothing is logged, the test passed.");
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(
      `----- ${test.name} -----${"-".repeat(maxNameLength - test.name.length)}`
    );
    await test.test();
  }

  console.log(`------------${"-".repeat(maxNameLength)}\nDone.`);
};

runTest();