import { Image, ScrollView } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import WeatherData from '../components/WeatherData';

const HomeScreen = () => {

    return (
        <SafeAreaView
            vertical
            style={{ flex: 1, paddingTop: StatusBar.currentHeight }}
        >
            {/* Background */}
            <Image
                source={require('../assets/images/bg-app.jpg')}
                style={{ position: 'absolute', width: '100%' }}
            />

            <ScrollView
                className='flex-1 mx-1'
            >
                <StatusBar style='light' />

                <WeatherData />
            </ScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen;