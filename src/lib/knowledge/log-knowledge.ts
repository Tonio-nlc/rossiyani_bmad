export function logKnowledge(message: string): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Knowledge] ${message}`);
  }
}
