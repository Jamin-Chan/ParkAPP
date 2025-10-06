import { StyleSheet, Text, View, Image, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { Link, Slot, Stack, Tabs } from 'expo-router'
//import CarIcon from '../../assets/img/CarIcon.jpg'
import { Colors } from "../../constants/Colors"

import React from 'react'
import { setStatusBarBackgroundColor } from 'expo-status-bar'


const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <View style={{flex: 1}}>
            
            {/* bottom of the page */}
            <Tabs 
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.navBackground,
                        paddingTop: 10,
                        height: 90
                    }
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                    }}
                />
                <Tabs.Screen
                    name="map"
                    options={{
                    title: 'map',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map-outline" size={size} color={color} />
                    ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                    title: 'profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                    }}
                />

            </Tabs>

        </View>
    )
}

export default RootLayout

const styles = StyleSheet.create({})