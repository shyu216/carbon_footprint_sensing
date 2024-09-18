import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Button } from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;

export default function Transport() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accelerometerData, setAccelerometerData] = useState({});
  const [gyroscopeData, setGyroscopeData] = useState({});
  const [magnetometerData, setMagnetometerData] = useState({});
  const [isAccelerometerActive, setIsAccelerometerActive] = useState(false);
  const [isGyroscopeActive, setIsGyroscopeActive] = useState(false);
  const [isMagnetometerActive, setIsMagnetometerActive] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          return;
        }

        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        console.log(location);

        // Fetch weather data
        const { latitude, longitude } = location.coords;
        const request_url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        console.log(request_url);
        const weatherResponse = await axios.get(request_url);
        setWeatherData(weatherResponse.data);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      }
    })();
  }, []);

  const toggleAccelerometer = () => {
    if (isAccelerometerActive) {
      Accelerometer.removeAllListeners();
    } else {
      Accelerometer.addListener((data) => {
        setAccelerometerData(data);
      });
    }
    setIsAccelerometerActive(!isAccelerometerActive);
  };

  const toggleGyroscope = () => {
    if (isGyroscopeActive) {
      Gyroscope.removeAllListeners();
    } else {
      Gyroscope.addListener((data) => {
        setGyroscopeData(data);
      });
    }
    setIsGyroscopeActive(!isGyroscopeActive);
  };

  const toggleMagnetometer = () => {
    if (isMagnetometerActive) {
      Magnetometer.removeAllListeners();
    } else {
      Magnetometer.addListener((data) => {
        setMagnetometerData(data);
      });
    }
    setIsMagnetometerActive(!isMagnetometerActive);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sensor Data</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
      <Text>Location: {JSON.stringify(location, null, 2)}</Text>
      <Text>Weather: {JSON.stringify(weatherData, null, 2)}</Text>
      <Button
        title={
          isAccelerometerActive ? "Stop Accelerometer" : "Start Accelerometer"
        }
        onPress={toggleAccelerometer}
      />
      <Text>Accelerometer: {JSON.stringify(accelerometerData, null, 2)}</Text>
      <Button
        title={isGyroscopeActive ? "Stop Gyroscope" : "Start Gyroscope"}
        onPress={toggleGyroscope}
      />
      <Text>Gyroscope: {JSON.stringify(gyroscopeData, null, 2)}</Text>
      <Button
        title={
          isMagnetometerActive ? "Stop Magnetometer" : "Start Magnetometer"
        }
        onPress={toggleMagnetometer}
      />
      <Text>Magnetometer: {JSON.stringify(magnetometerData, null, 2)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
