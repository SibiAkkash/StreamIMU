import {
  View,
  Text,
  StyleSheet,
  Alert,
  Switch,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { Input } from 'react-native-elements';

import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';

import Sensor from './Sensors';
const mqtt = require('@taoqf/react-native-mqtt');
import useInterval from '../helpers/useInterval';
import theme from '../constants/theme';
import sensorStyles from '../constants/sensorStyles';

import {
  connectionDetails,
  connectionOptions,
} from '../constants/mqttConnection';

import { Colors } from 'react-native/Libraries/NewAppScreen';

const { jaw_topic, link_topic, port, scheme, sensor_topic } = connectionDetails;

const SensorData = () => {
  const [serverIP, setServerIP] = useState('192.168.1.6');
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  // mqtt client reference
  const [clientRef, setClientRef] = useState(null);
  // sampleRate in Hz
  const [samplingRate, setSamplingRate] = useState(100);

  const [jawAngle, setJawAngle] = useState(0);
  const [linkAngle, setLinkAngle] = useState(0);

  // subscriptions for listening to sensor values
  const [accelSub, setAccelSub] = useState(null);
  const [gyroSub, setGyroSub] = useState(null);
  const [magSub, setMagSub] = useState(null);
  // sensors values
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });
  const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });

  useInterval(
    () => {
      clientRef.publish(
        sensor_topic,
        JSON.stringify({
          acc: accel,
          gyro: gyro,
          mag: mag,
        })
      );
    },
    isStreaming ? samplingRate : null
  );

  const connect = () => {
    const client = mqtt.connect(
      `${scheme}://${serverIP}:${port}`,
      connectionOptions
    );
    client.on('connect', () => {
      console.log('Connected to broker');
      setIsConnected(true);
    });
    setClientRef(client);
  };

  const disconnect = async () => {
    // close the connection if it exists
    clientRef && clientRef.end();
    console.log('disconnected from broker');
    setClientRef(null);
    setIsConnected(false);
  };

  const _subscribe = (sensorType) => {
    console.log(`Subscribing to ${sensorType}...`);
    switch (sensorType) {
      case 'Accelerometer':
        setAccelSub(Accelerometer.addListener((data) => setAccel(data)));
        Accelerometer.setUpdateInterval(samplingRate);
        break;
      case 'Gyroscope':
        setGyroSub(Gyroscope.addListener((data) => setGyro(data)));
        Gyroscope.setUpdateInterval(samplingRate);
        break;
      case 'Magnetometer':
        setMagSub(Magnetometer.addListener((data) => setMag(data)));
        Magnetometer.setUpdateInterval(samplingRate);
        break;
    }
  };

  const _unsubscribe = (sensorType) => {
    console.log(`Unsubscribing from ${sensorType}...`);
    switch (sensorType) {
      case 'Accelerometer':
        // remove the lisetener if it exits
        accelSub && accelSub.remove();
        // clear out the object
        setAccelSub(null);
        break;
      case 'Gyroscope':
        gyroSub && gyroSub.remove();
        setGyroSub(null);
        break;
      case 'Magnetometer':
        magSub && magSub.remove();
        setMagSub(null);
        break;
    }
  };

  const startStreaming = () => {
    if (isConnected && clientRef) {
      console.log('Streaming data...');
      setIsStreaming(true);
    }
  };

  const stopStreaming = () => {
    console.log('Stopping stream...');
    setIsStreaming(false);
  };

  const updateSamplingRate = (interval) => {
    // dont update sampling rate while streaming
    if (isStreaming) {
      Alert.alert("Don't change sampling rate while you're streaming !");
      return;
    }
    // clamp sampling rate between 1 and 100Hz
    interval = Math.max(interval, 50);
    setSamplingRate(interval);
    // update intervals for all sensors
    Accelerometer.setUpdateInterval(interval);
    Gyroscope.setUpdateInterval(interval);
    Magnetometer.setUpdateInterval(interval);
  };

  return (
    <SafeAreaView style={[styles.container, styles.borders]}>
      <Input
        label="IP address of mqtt broker"
        placeholder="192.168.1.2"
        onChangeText={(value) => setServerIP(value)}
      />
      <Input
        label="Sampling interval (min 50 ms)"
        placeholder="100ms"
        onChangeText={(interval) => updateSamplingRate(interval)}
      />
      {/* connect to broker */}
      <View style={[sensorStyles.sensorToggle]}>
        <Switch
          trackColor={{
            false: theme.trackFalseColor,
            true: theme.trackTrueColor,
          }}
          thumbColor={isConnected ? theme.thumbColor : theme.thumbColor}
          onValueChange={() => (isConnected ? disconnect() : connect())}
          value={isConnected}
          style={{
            transform: [{ scaleX: 1 }, { scaleY: 1 }],
          }}
        />
        <Text
          style={[
            sensorStyles.text,
            sensorStyles.sensorName,
            { color: '#ff9a00' },
          ]}
        >
          Connect to broker
        </Text>
      </View>
      {/* stream data toggle */}
      <View style={[sensorStyles.sensorToggle]}>
        <Switch
          trackColor={{
            false: theme.trackFalseColor,
            true: theme.trackTrueColor,
          }}
          thumbColor={isStreaming ? theme.thumbColor : theme.thumbColor}
          onValueChange={() =>
            isStreaming ? stopStreaming() : startStreaming()
          }
          value={isStreaming}
          style={{
            transform: [{ scaleX: 1 }, { scaleY: 1 }],
          }}
        />
        <Text
          style={[
            sensorStyles.text,
            sensorStyles.sensorName,
            { color: '#ff9a00' },
          ]}
        >
          Stream data
        </Text>
      </View>

      <Sensor
        subscription={accelSub}
        sensorName={'Accelerometer'}
        subscribe={_subscribe}
        unsubscribe={_unsubscribe}
      />
      <Sensor
        subscription={gyroSub}
        sensorName={'Gyroscope'}
        subscribe={_subscribe}
        unsubscribe={_unsubscribe}
      />
      <Sensor
        subscription={magSub}
        sensorName={'Magnetometer'}
        subscribe={_subscribe}
        unsubscribe={_unsubscribe}
      />

      <Slider
        style={{ width: 200, height: 50 }}
        minimumValue={-1}
        maximumValue={1}
        minimumTrackTintColor="#000000"
        maximumTrackTintColor="#000000"
        step={0.2}
        value={jawAngle}
        onValueChange={(angle) => {
          clientRef.publish(
            jaw_topic,
            JSON.stringify({
              jaw_angle: angle,
            })
          );
          setJawAngle(angle);
        }}
      />
      <Text>Jaw angle: {jawAngle} degrees</Text>

      <Slider
        style={{ width: 200, height: 50 }}
        minimumValue={0}
        maximumValue={5}
        minimumTrackTintColor="#000000"
        maximumTrackTintColor="#000000"
        step={1}
        value={linkAngle}
        onValueChange={(angle) => {
          clientRef.publish(
            link_topic,
            JSON.stringify({
              link_angle: angle,
            })
          );
          setLinkAngle(angle);
        }}
      />
      <Text>Link angle: {linkAngle} degrees</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  borders: {
    // borderColor: "green",
    // borderWidth: 3,
  },
  container: {
    flex: 1,
    // width: '90%',
    // height: '100%',

    flexGrow: 1,
    flexBasis: 'auto',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    marginHorizontal: 0,
    marginVertical: 100,
    padding: 30,
    backgroundColor: Colors.light,
  },
});

export default SensorData;
