import { StyleSheet, Text, View, Image, Alert, ActivityIndicator, Callout } from 'react-native'
import React, { useState, useEffect, useRef } from "react";
import { Link } from 'expo-router'
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';
import { doc, getDoc, collection, getDocs, query, Timestamp, orderBy, limit} from "firebase/firestore";
import { db } from '../../FirebaseConfig'


const Map = () => {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);
  const [testPin, setTestPin] = useState(null);

  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to show your position on the map.');
        return;
      }
      // querying pins from "pins" collection for parking officers
      // confirmation that it works
       try {
        const q = query(
          collection(db, "pins"),
          orderBy("creation_date", "desc")
        );
        const snapshot = await getDocs(q);
        const doc = snapshot.docs[0];
        const data = doc.data();
        console.log(data);
        const pin = { id: doc.id, creation_date: data.creation_date,  coords: data.coords};
        console.log("pin", pin);
        setTestPin(pin);
      } catch (e) {
        console.error("Fetch failed:", e);
      }
      
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Animate map to user's location if available
      if (mapRef.current && currentLocation) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 1000); // 1 second duration
      }
    })();
  }, []);

  useEffect(() => {
    const fetchMeters = async () => {
      // try {
      //   const snapshot = await getDocs(collection(db, 'meters').limit(1000));
      //   const data = snapshot.docs.map(doc => ({
      //     id: doc.id, // This gets the document ID (like "Address")
      //     coord: doc.data().coord, // This gets the {lat, lon} object
      //     price: doc.data().price  // This gets the price object with day arrays
      //   }));
      //   console.log(`Loaded ${data.length} meters`);
      //   console.log("Sample meter:", data[0]); // Log first meter to verify structure
      // } catch (error) {
      //   console.error('Error fetching meters:', error);
      // } finally {
      //   setLoading(false);
      // }

    try {
      console.log("fetching meters")
      const snapshot = await getDocs(query(collection(db, 'meters'), limit(100))); //eRRRORRRRR HERRE
      console.log("fetching meters ling")
      console.log(`Found ${snapshot.docs.length} documents`);
      
      const metersArray = [];
      
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data();
          metersArray.push({
            id: doc.id,
            coord: data.coord || { lat: 0, lon: 0 },
            price: data.price || {}
          });
        } catch (docError) {
          console.warn(`Error processing document ${doc.id}:`, docError);
          // Skip this document but continue with others
        }
      }
      
      console.log(`Successfully loaded ${metersArray.length} meters`);
      setMeters(metersArray);
      
    } catch (error) {
      console.error('Error fetching meters:', error);
      setMeters([]);
    } finally {
      setLoading(false);
    }

    };
    fetchMeters();
  }, []);

  const getCurrentPrice = (priceData) => {
    if (!priceData) return 0;
    
    try{
      const now = new Date();
      const dayNames = ['sun', 'mon', 'tues', 'weds', 'thurs', 'fri', 'sat'];
      const dayKey = dayNames[now.getDay()];

      const hour = now.getHours();
      const minute = now.getMinutes();
      const halfHourIndex = hour * 2 + (minute >= 30 ? 1 : 0);

      const prices = priceData[dayKey];
      if (!prices || !Array.isArray(prices)) return 0;

      const price = prices[halfHourIndex] ?? 0;
    } catch (error){
      console.log("price error")
    }
    return price;
  };

   if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading map...</Text>
      </View>
    );
  }


  return (
    // <View style={styles.container}>
    //   <MapView
    //     style={styles.map}
    //     initialRegion={{
    //       latitude: 37.78825,    // Example: San Francisco
    //       longitude: -122.4324,
    //       latitudeDelta: 0.0922, // Zoom levels
    //       longitudeDelta: 0.0421,
    //     }}
    //   >
    //     <Marker
    //       coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
    //       title="My Marker"
    //       description="Here’s a marker!"
    //     />
    //   </MapView>
    // </View>
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: testPin.coords.latitude,
            longitude: testPin.coords?.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          followsUserLocation={false} // Optional: Map follows user's location as they move
        >

          {meters.slice(0,10).map((meter) => (
            <Marker
              key={meter.id}
              coordinate={{
                latitude: meter.coord?.lat || 0,
                longitude: meter.coord?.lon || 0,
              }}
              title={meter.id}
              description="Here’s a marker!"
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

export default Map

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  card: {
    backgroundColor: '#eee',
    padding: 20,
    borderRadius: 5,
    boxShadow: '4px 4px rgba(0,0,0,0.1)'
  }
})