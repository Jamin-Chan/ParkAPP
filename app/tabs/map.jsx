import { StyleSheet, Text, View, Image, Alert } from 'react-native'
import React, { useState, useEffect, useRef } from "react";
import { Link } from 'expo-router'
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';
import { collection, getDocs, query, Timestamp, orderBy} from "firebase/firestore";
import { db } from '../../FirebaseConfig'


const Map = () => {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);
  const [testPin, setTestPin] = useState(null);

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
        />
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