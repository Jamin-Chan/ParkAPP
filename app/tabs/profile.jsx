import { StyleSheet, Text, View, Image } from 'react-native'
import React from "react";
import { Link } from 'expo-router'
import MapView, { Marker } from "react-native-maps";


const Profile = () => {
  return (
    <View style={styles.container}>

        <Text>Profile</Text>

    </View>
  )
}

export default Profile

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