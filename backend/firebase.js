// firebase.js - initialize admin SDK
const admin = require("firebase-admin");
const path = require("path");

// Ensure firebase-key.json (service account) is in backend/ and not checked into git
const keyPath = path.join(__dirname, "firebase-key.json");
admin.initializeApp({
  credential: admin.credential.cert(require(keyPath))
});

const db = admin.firestore();
module.exports = db;
