// Track cancelled scraper runs
const cancelledRuns = new Set();

const markForCancellation = (runId) => {
  cancelledRuns.add(runId);
  console.log(`[Cancellation] Run ${runId} marked for cancellation`);
};

const isCancelled = (runId) => {
  return cancelledRuns.has(runId);
};

const clearCancellation = (runId) => {
  cancelledRuns.delete(runId);
};

module.exports = {
  markForCancellation,
  isCancelled,
  clearCancellation,
};
