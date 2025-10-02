import { StyleSheet, Text, View, Image } from 'react-native'
import { Link } from 'expo-router'
import CarIcon from '../assets/img/CarIcon.jpg'

import React from 'react'


const Home = () => {
  return (
    <View style={styles.container}>
        <Image source={CarIcon} style={styles.img} />

        <Text style={styles.title}>Home</Text>

        <Text style={{margin: 10}}>Testing 1</Text>

        <View style={styles.card}>
            <Text>Hello this is testing 2</Text>
        </View>

        <Link href="/map">map</Link>

    </View>
  )
}

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