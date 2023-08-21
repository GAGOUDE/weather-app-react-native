import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import * as Progress from 'react-native-progress';
import { getData, storeData } from '../utils/asyncStorage';

const WeatherData = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('fr');

    const handleLocation = (loc) => {
        // console.log('Location : ', loc);
        setLocations([]);
        setShowSearch(false);
        setLoading(true);

        fetchWeatherForecast({
            cityName: loc.name,
            days: '7',
            lang: selectedLanguage
        }).then(data => {
            console.log('got forecast: ', data);
            setWeather(data);
            setLoading(false);
            // Async storage
            storeData('city', loc.name);
        })
    }

    const handleSearch = value => {
        // Fetch locations
        if (value.length > 2) {
            fetchLocations({
                cityName: value,
                lang: selectedLanguage
            }).then(data => {
                // console.log('got locations: ', data);
                setLocations(data);
            })
        }
    }

    // Language selected
    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        fetchMyWeatherData(lang);
    }

    // First Data to show up
    useEffect(() => {
        fetchMyWeatherData(selectedLanguage);
    }, [selectedLanguage]);

    const fetchMyWeatherData = async () => {
        // Async storage
        let myCity = await getData('city');
        let cityName = 'Bangui';
        if (myCity) cityName = myCity;

        fetchWeatherForecast({
            cityName,
            days: '7',
            lang: selectedLanguage
        }).then(data => {
            setWeather(data);
            setLoading(false);
        })
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

    const { current, location } = weather;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior='padding'
        >
            {
                loading ? (
                    <View className='flex-1 flex-row justify-center items-center'>
                        <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
                    </View>
                ) : (
                    <SafeAreaView className='flex flex-1'>
                        {/*========== Search Section */}
                        <View style={{ height: 100, paddingTop: 0 }} className='mx-4 relative z-50'>
                            <View
                                className='flex-row justify-end items-center rounded-full'
                                style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}
                            >
                                {
                                    showSearch ? (
                                        <TextInput
                                            onChangeText={handleTextDebounce}
                                            placeholder={selectedLanguage === 'en' ? 'Search city' : 'Rechercher une ville'}
                                            placeholderTextColor={'lightgray'}
                                            className="pl-6 pb-1 h-10 flex-1 text-lg text-white"
                                        />
                                    ) : null
                                }

                                <TouchableOpacity
                                    onPress={() => setShowSearch(!showSearch)}
                                    style={{ backgroundColor: theme.bgWhite(0.4) }}
                                    className="rounded-full p-3 m-1 border-2 border-yellow-300"
                                >
                                    <MagnifyingGlassIcon size="25" color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Location */}
                            {
                                locations.length > 0 && showSearch ? (
                                    <View className="absolute w-full bg-gray-300 top-20 rounded-3xl px-1">
                                        {
                                            locations.map((loc, index) => {
                                                let showBorder = index + 1 != locations.length;
                                                let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => handleLocation(loc)}
                                                        key={index}
                                                        className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}
                                                    >
                                                        <MapPinIcon size="20" color="gray" />
                                                        <Text className="text-black text-lg ml-2">
                                                            {loc?.name}, {loc?.country}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                ) : null
                            }
                        </View>

                        {/*========== Language selected  */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 0 }}>
                            <TouchableOpacity
                                onPress={() => handleLanguageChange('en')}
                                style={{
                                    backgroundColor: selectedLanguage === 'en' ? '#36a355' : 'gray',
                                    padding: 12,
                                    borderRadius: 5,
                                    marginRight: 10,

                                }}
                            >
                                <Text style={{ color: 'white', fontSize: 20 }}>English</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleLanguageChange('fr')}
                                style={{
                                    backgroundColor: selectedLanguage === 'fr' ? '#36a355' : 'gray',
                                    padding: 10,
                                    borderRadius: 5
                                }}
                            >
                                <Text style={{ color: 'white', fontSize: 20 }}>Français</Text>
                            </TouchableOpacity>
                        </View>

                        {/*========== Forecast Section */}
                        <View className="mx-4 flex justify-center flex-1 mb-2 mt-4">
                            {/* Location */}
                            <Text className="text-white text-center text-2xl font-bold">
                                {location?.name},
                                <Text className="text-lg font-semibold text-gray-300">{" " + location?.country}</Text>
                            </Text>

                            {/* Weather Image */}
                            <View className="flex-row justify-center">
                                <Image
                                    //===From API
                                    source={{ uri: 'https://' + current?.condition?.icon }}
                                    style={{ width: 140, height: 140 }}
                                />
                            </View>

                            {/* Degree celcius */}
                            <View>
                                <Text className="text-center font-bold text-white text-6xl ml-5">
                                    {current?.temp_c}&#176;C
                                </Text>
                                <Text className="text-center text-white text-xl tracking-widest">
                                    {current?.condition?.text}
                                </Text>
                            </View>

                            {/* OTHER STATS */}
                            <View className="flex-row justify-between mx-4 my-5">
                                {/* Wind */}
                                <View className="flex-row space-x-2 items-center">
                                    <Image
                                        source={require('../assets/icons/wind.png')}
                                        className="h-6 w-6"
                                    />
                                    <Text
                                        className="text-white font-semibold text-base"
                                    >
                                        {current?.wind_kph}km
                                    </Text>
                                </View>

                                {/* Humidity */}
                                <View className="flex-row space-x-2 items-center">
                                    <Image
                                        source={require('../assets/icons/drop.png')}
                                        className="h-6 w-6"
                                    />
                                    <Text
                                        className="text-white font-semibold text-base"
                                    >
                                        {current?.humidity}%
                                    </Text>
                                </View>

                                {/* Time */}
                                <View className="flex-row space-x-2 items-center">
                                    <Image
                                        source={require('../assets/icons/sun.png')}
                                        className="h-6 w-6"
                                    />
                                    <Text
                                        className="text-white font-semibold text-base"
                                    >
                                        {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/*========== Forecast for next days section */}
                        <View className="mb-2 space-y-3">
                            <View className="flex-row items-center mx-5 space-x-2">
                                <CalendarDaysIcon size="25" color="white" />
                                <Text className="text-white text-lg font-bold"> {selectedLanguage === 'en' ? 'Daily forecast' : 'Prévisions quotidiennes'} </Text>
                            </View>

                            <ScrollView
                                horizontal
                                contentContainerStyle={{ paddingHorizontal: 15 }}
                                showsHorizontalScrollIndicator={false}
                            >
                                {
                                    weather?.forecast?.forecastday?.map((item, index) => {
                                        {/* Date configuration */ }
                                        let date = new Date(item.date);
                                        let options = { weekday: 'long' };
                                        let dayName = date.toLocaleDateString(selectedLanguage === 'fr' ? 'fr-FR' : 'en-US', options);
                                        dayName = dayName.split(' ')[0].toUpperCase();

                                        return (
                                            <View
                                                key={index}
                                                className="flex justify-center items-center rounded-2xl space-y-1 mr-4"
                                                style={{ backgroundColor: theme.bgWhite(0.3), width: 100, height: 190, borderWidth: 1, borderColor: theme.bgWhite(0.5), paddingBottom: 30 }}
                                            >
                                                <Image
                                                    //===From API
                                                    source={{ uri: 'https://' + current?.condition?.icon }}
                                                    //=== From my own assets
                                                    // source={weatherImages[current?.condition?.text]}
                                                    style={{ width: "85%", height: "85%", objectFit: "contain" }}
                                                />
                                                <Text className="text-white">{dayName}</Text>
                                                <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c}&#176;C</Text>
                                            </View>
                                        )
                                    })
                                }

                            </ScrollView>
                        </View>
                    </SafeAreaView>
                )
            }
        </KeyboardAvoidingView>
    )
}

export default WeatherData;