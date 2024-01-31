import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, ImageBackground, Image, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [prevision, setPrevision] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();
  }, []);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      fetchWeatherData();
      fetchWeatherPrev();
    }
  }, [latitude, longitude]);

  const organizeForecastData = (prevision) => {
    const organizedData = {};

    prevision.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (!organizedData[date]) {
        organizedData[date] = {
          date,
          times: [],
        };
      }

      organizedData[date].times.push({
        time,
        icon: item.weather[0].icon,
        temp: item.main.temp,
        description: item.weather[0].description,
      });
    });

    return Object.values(organizedData);
  };

  const fetchWeatherData = async () => {
    const currentDate = new Date().toISOString().slice(0, 10);
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&date=${currentDate}&tz={tz}&lon=${longitude}&appid=21c49d1e5eba15074b0a4b4f391a369d&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.log('Error fetching weather data', error);
    }
  };

  const fetchWeatherPrev = async () => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=21c49d1e5eba15074b0a4b4f391a369d&units=metric`;

    try {
      const response = await fetch(url);
      const prevision = await response.json();
      setPrevision(organizeForecastData(prevision));
    } catch (error) {
      console.log('Error fetching weather data Preview', error);
    }
  };

  const image = require('./assets/fond.jpg');

  return (
    <View style={styles.container}>
      <ImageBackground blurRadius={10} source={image} resizeMode="cover" style={styles.image}>
        <View style={styles.overlay}>
          {weatherData && (
            <View>
              <Text style={styles.topLeftText}>{weatherData.name}</Text>
              <Image style={styles.imageIcon} source={{ uri: `http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png` }} />
              <Text style={styles.text}>{weatherData.main.temp} °C</Text>
              <Text style={styles.text}>{new Date().toLocaleDateString()}</Text>
              <Text style={styles.text}>{weatherData.weather[0].description}</Text>
            </View>
          )}
          {prevision && (
            <View>
              <ScrollView vertical={true}>
                {prevision.map((dayData) => (
                  <View key={dayData.date} style={styles.dayContainer}>
                    <Text>{dayData.date}</Text>
                    <ScrollView horizontal={true}>
                      {dayData.times.map((timeData) => (
                          <View key={timeData.time} style={styles.timeContainer}>
                            <Text>{timeData.time}</Text>
                            <Image source={{ uri: `http://openweathermap.org/img/w/${timeData.icon}.png` }} />
                            <Text>{timeData.temp} °C</Text>
                            <Text>{timeData.description}</Text>
                          </View>
                      ))}
                    </ScrollView>
                  </View>
                ))}

              </ScrollView>
            </View>
          )}
        </View>
        <StatusBar style="light" />
      </ImageBackground>
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  imageIcon: {
    width: windowWidth * 0.6,
    height: windowWidth * 0.6,
  },

  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: windowWidth,
    height: windowHeight,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    color: '#fff',
    fontSize: 40,
    textAlign: 'center',
    margin: 5,
  },

  topLeftText: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    left: -70,
    color: '#fff',
    fontSize: 40,
    zIndex: 1,
  },

  dayContainer: {
    flexDirection: 'row',
    width: 350,
    margin: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
  },

  timeContainer: {
    margin: 5,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
  },
});
