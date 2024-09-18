import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { LightSensor } from "expo-sensors";
import * as Location from "expo-location";
import { Audio } from "expo-av";

export default function ElectricalAppliances() {
  const [lightData, setLightData] = useState<number | null>(null);
  const [noiseData, setNoiseData] = useState<number | null>(null);
  const [isLightDetecting, setIsLightDetecting] = useState(false);
  const [isNoiseDetecting, setIsNoiseDetecting] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    // Request location permissions
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
    })();
  }, []);

  const startLightDetection = () => {
    LightSensor.addListener((data) => {
      setLightData(data.illuminance);
    });
    setIsLightDetecting(true);
  };

  const stopLightDetection = () => {
    LightSensor.removeAllListeners();
    setIsLightDetecting(false);
  };

  const startNoiseDetection = async () => {
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    if (audioStatus !== "granted") {
      console.log("Permission to access microphone was denied");
      return;
    }

    const newRecording = new Audio.Recording();
    try {
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);

      // Polling the volume level
      setInterval(async () => {
        const status = await newRecording.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          setNoiseData(status.metering);
        }
      }, 1000);
      setIsNoiseDetecting(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopNoiseDetection = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setIsNoiseDetecting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Electrical Appliances Status</Text>

      <Button
        title={
          isLightDetecting ? "Stop Light Detection" : "Start Light Detection"
        }
        onPress={isLightDetecting ? stopLightDetection : startLightDetection}
      />
      <Text>Light: {lightData !== null ? lightData : "Loading..."}</Text>

      <Button
        title={
          isNoiseDetecting ? "Stop Noise Detection" : "Start Noise Detection"
        }
        onPress={isNoiseDetecting ? stopNoiseDetection : startNoiseDetection}
      />
      <Text>Noise: {noiseData !== null ? noiseData : "Loading..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
