import { StyleSheet, Text, View, Image } from 'react-native'
import React from "react";
import { Link } from 'expo-router'
import MapView, { Marker } from "react-native-maps";


const Map = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,    // Example: San Francisco
          longitude: -122.4324,
          latitudeDelta: 0.0922, // Zoom levels
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="My Marker"
          description="Here’s a marker!"
        />
      </MapView>

      <Link href="/">back</Link>

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
})