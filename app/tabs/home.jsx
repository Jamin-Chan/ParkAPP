import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, SafeAreaView } from 'react-native'
import { Link, useRouter  } from 'expo-router'
import CarIcon from '../../assets/img/CarIcon.jpg'
import { auth } from '../../FirebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../FirebaseConfig'
import React, { useState, useEffect } from 'react'

const Home = () => {
  const router = useRouter();

  const getData = async () => {
    try {
      const pinsCollection = collection(db, 'pins');
      const snapshot = await getDocs(pinsCollection);
      const pinsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched pins:', pinsData);
      return pinsData;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleMapClick = async () => {
    const data = await getData();
    router.push({
        pathname: '/tabs/map',
        params: { pins: JSON.stringify(data) },
    });
  };

  return (
    <View style={styles.container}>
      <Image source={CarIcon} style={styles.img} />
      <Text style={styles.title}>Home</Text>

      <Text style={{ margin: 10 }}>Testing 1</Text>

      <View style={styles.card}>
        <Text>Hello this is testing 2</Text>
      </View>
      <TouchableOpacity style={styles.card} onPress={handleMapClick} href="/tabs/map">
        <Text>Map</Text>
      </TouchableOpacity>
    </View>
  );
};
export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white'
    },
    img: {
        maxHeight: '5px',
        maxWidth: '5px',
    },
    card: {
        backgroundColor: '#eee',
        padding: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0,0,0,0.1)'
    }
})