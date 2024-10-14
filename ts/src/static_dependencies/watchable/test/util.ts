// eslint-disable-next-line @typescript-eslint/promise-function-async
export function sleep(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
