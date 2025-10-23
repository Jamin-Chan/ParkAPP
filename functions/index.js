/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const Papa = require("papaparse");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");

const {setGlobalOptions} = require("firebase-functions");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");

const METERS_API = "https://data.sfgov.org/resource/8vzz-qzz9.json"; 
const RATES_API = "https://data.sfgov.org/resource/fwjv-32uk.json"; 

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore();

exports.updateParkingRates = onSchedule("every 1 weeks", async (event) => {
    console.log("Fetching CSV from SFMTA...");
    const csvUrl = "https://data.sfgov.org/resource/8vzz-qzz9.csv?$limit=99999999999";

    const response = await fetch(csvUrl);
    const csvText = await response.text();

    console.log("Parsing CSV...");
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    if (!parsed || !parsed.data || !Array.isArray(parsed.data)) {
      throw new Error("CSV parse failed — invalid structure.");
    }
    
    const data = parsed.data;
    console.log(`✅ Parsed ${data.length} rows`);
    //console.log(`Fetched ${meterData.length} records`);

    // group by post_id
    const meters = {};

    for (const row of data) {
      const post_id = row.post_id;
      if (!post_id) continue;

      if (!meters[post_id]) {
        meters[post_id] = {
          coord: {
            lat: parseFloat(row.latitude),
            lon: parseFloat(row.longitude),
          }
        };
      }

    //   // Parse the schedule type only if it's "OP" (operational)
    //   if (row.schedule_type !== "OP") continue;

    //   // Convert day string -> lowercase key
    //   const dayKey = row.day_of_week?.toLowerCase();
    //   const hour = parseInt(row.hour);

    //   if (dayKey && !isNaN(hour)) {
    //     meters[post_id].prices[dayKey][hour] = parseFloat(row.rate);
    //   }
    // }

    // console.log(`Processed ${Object.keys(meters).length} meters`);

    // // Write to Firestore
    // for (const [post_id, meter] of Object.entries(meters)) {
    //   const ref = doc(db, "parking_meters", post_id);
    //   await setDoc(ref, meter);
    }
    console.log(meters)

    console.log("✅ All parking meters stored in Firestore");

});
