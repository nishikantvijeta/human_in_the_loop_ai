// timeoutWorker.js
const db = require("./firebase");

async function runTimeoutCheck() {
  try {
    const now = Date.now();
    const snapshot = await db.collection("help_requests").where("status", "==", "pending").get();
    snapshot.forEach(async (doc) => {
      const data = doc.data();
      const timeoutMs = (data.timeout_seconds || 600) * 1000;
      if ((data.created_at || 0) + timeoutMs < now) {
        // Atomically update status if still pending
        await doc.ref.update({
          status: "unresolved",
          updated_at: now,
          unresolved_at: now
        });
        // Notify (console); in prod you may send actual SMS/webhook
        const phone = data.customer?.phone || "unknown";
        console.log(`[TIMEOUT] Help request ${doc.id} timed out. Notifying customer ${phone}.`);
        console.log(`[AI -> ${phone}] Sorry, our supervisor is unavailable right now. We will follow up.`);
      }
    });
  } catch (err) {
    console.error("timeoutWorker error:", err);
  }
}

// Export function to start interval
function start(intervalMs = 60_000) {
  // First run immediately, then every intervalMs
  runTimeoutCheck();
  setInterval(runTimeoutCheck, intervalMs);
}

module.exports = { start };
