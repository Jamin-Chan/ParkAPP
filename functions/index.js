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
const geohash = require('ngeohash');

const {setGlobalOptions} = require("firebase-functions");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

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
    const meterLoc = "https://data.sfgov.org/resource/8vzz-qzz9.csv?$limit=99999999999";
    const meterPrice = "https://data.sfgov.org/resource/qq7v-hds4.csv?$limit=99999999999";
    const blockfaceLoc = "https://data.sfgov.org/resource/mk27-a5x2.csv?$limit=99999999999";

    const response = await fetch(meterLoc);
    const csvText = await response.text();

    const response2 = await fetch(meterPrice);
    const csvText2 = await response2.text();

    const responseBlockface = await fetch(blockfaceLoc);
    const csvTextBLockface = await responseBlockface.text();

    console.log("Parsing CSV...");
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const parsed2 = Papa.parse(csvText2, { header: true, skipEmptyLines: true });
    const parsedBlockface = Papa.parse(csvTextBLockface, { header: true, skipEmptyLines: true });

    if (!parsed || !parsed.data || !Array.isArray(parsed.data)) {
      throw new Error("CSV parse failed — invalid structure.");
    }
    
    const locationData = parsed.data;
    const priceData = parsed2.data;
    const blockfaceData = parsedBlockface.data;

    console.log(`✅ Parsed ${locationData.length} rows`);
    console.log(`✅ Parsed ${priceData.length} rows`);
    console.log(`✅ Parsed ${blockfaceData.length} rows`);
    //console.log(`Fetched ${meterData.length} records`);

    // group by post_id
    const meters = {};
    const blocks = {};

    for (const row of locationData) {
      const post_id = row.post_id;
      if (!post_id) continue;

      // const lat = parseFloat((row.lat || row.latitude || row.y));
      // const lon = parseFloat((row.lon || row.longitude || row.x));
      const block_id = parseFloat((row.blockface_id));

      meters[post_id] = {
        block_id: block_id
        // coord: {
        //   lat1: 0,
        //   lat2: 0,
        //   lon1: 0,
        //   lon2: 0
        //   //geohash: geohash.encode(lat, lon)
        // },
      };
    }

    // Helper: convert "4:30" → slot index
    const timeToSlot = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(":").map(Number);
      return h * 2 + (m >= 30 ? 1 : 0);
    };

    // Map abbreviated days to Firestore keys
    const dayMap = {
      Mo: "mon",
      Tu: "tues",
      We: "weds",
      Th: "thurs",
      Fr: "fri",
      Sa: "sat",
      Su: "sun",
    };

    //process blockid locations
    for (const row of blockfaceData){
      const blockface_id = parseFloat(row.blockface_id);

    //if (!blockface_id || !meters[blockface_id]) continue;


      const lon1 = parseFloat(row.endpt1_longitude);
      const lon2 = parseFloat(row.endpt2_longitude);
      const lat1 = parseFloat(row.endpt1_latitude);
      const lat2 = parseFloat(row.endpt2_latitude);


      blocks[blockface_id] = {
        coords: {
          lat1: lat1,
          lat2: lat2,
          lon1: lon1,
          lon2: lon2,
        },
        price: {
          mon: Array(48).fill(0),
          tues: Array(48).fill(0),
          weds: Array(48).fill(0),
          thurs: Array(48).fill(0),
          fri: Array(48).fill(0),
          sat: Array(48).fill(0),
          sun: Array(48).fill(0),
        },
        midpoint: {
          midLat: (lat1+lat2)/2,
          midLon: (lon1+lon2)/2,
        }
      };
      //console.log("current blockface: ", blocks[blockface_id]);
    }



    // Process price data
    for (const row of priceData) {
      const post_id = row.postid;
      if (!post_id || !meters[post_id]) continue;

      if(row.scheduletype == "OP"){
        const dayKey = dayMap[row.dayofweek];
        if (!dayKey) continue;

        const start = timeToSlot(row.starttime);
        const end = timeToSlot(row.endtime);

        // You can parse rate from another column — for example, "rate" or "price"
        const rate = parseFloat(row.hourlyrate || 0);

        const block_id = meters[post_id].block_id
        //console.log(block_id)
        if (!block_id || !blocks[block_id]) continue;

        // Fill in half-hour blocks with rate
        for (let i = start; i < end; i++) {
          blocks[block_id].price[dayKey][i] = rate;
        }
      }
    }

    const updatedBlocks = {};

    for (const [block_id, block] of Object.entries(blocks)) {
      if (!block_id || !block) continue;

      const meterCopy = { ...block };
      const price = { ...meterCopy.price };
      
      // Check if all weekdays (Mon-Fri) have identical pricing
      const weekdays = ["mon", "tues", "weds", "thurs", "fri"];
      const allWeekdaysSame = weekdays.every(day => 
        price[day] && 
        JSON.stringify(price[day]) === JSON.stringify(price[weekdays[0]])
      );

      if (allWeekdaysSame && weekdays[0] in price) {
        // Replace individual weekdays with combined 'weekday' array
        price.weekday = [...price[weekdays[0]]];
        
        // Remove individual weekday arrays
        weekdays.forEach(day => {
          delete price[day];
        });
        
        //console.log(`Combined weekdays for meter ${post_id}`);
      }

      // Check if ANY day is all zeros (free parking)
      const allDays = ["mon", "tues", "weds", "thurs", "fri", "sat", "sun", "weekday"];
      
      allDays.forEach(day => {
        if (price[day] && Array.isArray(price[day]) && price[day].every(rate => rate === 0)) {
          price[day] = "free";
          //console.log(`${day} is free for meter ${post_id}`);
        }
      });

      // Update the meter with optimized price structure
      updatedBlocks[block_id] = {
        ...meterCopy,
        price: price
      };
    }

    // for (const row of meters) {
    

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
    //console.log(meters)
    console.log("Sample row:", meters["221-32010"]);


    let batch = db.batch();
    let writeCount = 0;

    for (const [block_id, block] of Object.entries(updatedBlocks)) {
      const ref = db.collection("meters").doc(block_id);
      batch.set(ref, block);
      writeCount++;

      // Commit every 500 writes
      if (writeCount % 500 === 0) {
        console.log(`Committing batch at ${writeCount} documents...`);
        await batch.commit();
        batch = db.batch(); // start a new batch
      }
    }

    console.log("✅ All parking meters stored in Firestore");

});
