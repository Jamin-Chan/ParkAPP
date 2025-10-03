import { StyleSheet, Text, View, Image, useColorScheme } from 'react-native'
import { Link, Slot, Stack, Tabs } from 'expo-router'
import CarIcon from '../assets/img/CarIcon.jpg'
import { Colors } from "../constants/Colors"

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
            />

            <Text>Footer</Text>
        </View>
    )
}

export default RootLayout

const styles = StyleSheet.create({})