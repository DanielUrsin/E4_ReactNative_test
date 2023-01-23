/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useState, useEffect, Component} from 'react';
const { TestModule } = NativeModules;
import { NativeEventEmitter } from 'react-native';
import notifee, { AndroidAction, AndroidColor, AndroidImportance, EventType } from '@notifee/react-native';

import NetInfo from "@react-native-community/netinfo";
import type {Node} from 'react';
import {
    Text,
    Button,
    View,
    NativeModules,
    Vibration,
    useColorScheme,
    PermissionsAndroid,
    Platform, } from 'react-native';










const App: () => Node = () => {

    const [netConnection, setNetConnection] = useState(false);
    const [channelId, setChannelId] = useState(null);
    const [currMsg, setCurrMsg] = useState(null)

    const [statusEventListener, setStatusListener] = useState(null);
    const [dataEventListener, setDataListener] = useState(null);
    const [errorEventListener, setErrorListener] = useState(null);

    const [onWrist, setOnWrist] = useState("false");
    const [status, setStatus] = useState("Not connected");
    const [deviceName, setDeviceName] = useState("No device connected");
    const [temperature, setTemperature] = useState("-1");
    const [count, setCount] = useState(0);
    const [latestTime, setLatestTime] = useState("");

    const empaticaEvents = new NativeEventEmitter(NativeModules.ToastExample);



    var n1 = {
        id:"123",
        title: 'Device not detected',
        body: 'Connect device to start monitoring.',
        android: {
            asForegroundService: true,
            ongoing: true,
            color: AndroidColor.RED,
            colorized: true,
            channelId:"MainNotification",
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_status_disconnected',
            pressAction: {
                id: 'default',
            },
            vibration: false,
            actions: [{
                title: 'Stop',
                pressAction: {
                    id: 'stop',
                },
            }],
        },
    }
    var n2 = {
        id:"123",
        title: 'Device not on wrist',
        body: 'Wear device to record data.',
        android: {
            // asForegroundService: true,
            ongoing: true,
            color: AndroidColor.YELLOW,
            colorized: true,
            channelId:"MainNotification",
            smallIcon: 'ic_status_connected', // optional, defaults to 'ic_launcher'.
            // pressAction is needed if you want the notification to open the app when pressed
            pressAction: {
                id: 'default',
            },
            // Displays option for removing notification
            actions: [{
                title: 'Stop',
                pressAction: {
                  id: 'stop',
                },
            }],
        },
    }
    var n3 = {
        id:"123",
        title: 'All good!',
        body: 'Device connected and recording data.',
        android: {
            // asForegroundService: true,
            ongoing: true,
            color: AndroidColor.GREEN,
            colorized: true,
            channelId:"MainNotification",
            smallIcon: 'ic_status_onwrist', // optional, defaults to 'ic_launcher'.
            // pressAction is needed if you want the notification to open the app when pressed
            pressAction: {
                id: 'default',
            },
            // Displays option for removing notification
            actions: [{
                  title: 'Stop',
                  pressAction: {
                      id: 'stop',
                  },
                  title: 'Penis',
                  pressAction: {
                      id: 'stop',
                  },
            }],
        },
    }


    // Async helper functions
    async function checkAllPermission() {
        console.log("Requesting all")
        const os_version = Platform.constants['Release'];
        var result1 = false;
        var result2 = false;
        var result3 = false;

        if (os_version < 12){
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            result1 = true;
            result2 =  await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            result3 =  await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION);
        }
        else {
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION);
            result1 = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
            result2 = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
            result3 = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION);
        }
        if (result1 && result2 && result3) {
            console.log("Android version "+os_version+". All permissions granted.");
            return true;
        }
        console.log("Android version "+os_version+". Some permissions denied.");
        return false;
    };
    async function checkConnection() {
        var status = await NetInfo.fetch();
        await setNetConnection(status.isConnected);
        console.log("Checked connection")
    };
    async function createNotificationChannel() {
        var newChannel = await notifee.createChannel({
            id: 'MainNotification',
            name: 'Channel',
            // vibrationPattern: [300, 500],
            vibration: false,
        });
        await setChannelId(newChannel);
        await notifee.requestPermission();
        await onDisplayNotification(n1);




    }
    async function onDisplayNotification(notification) {
        await notifee.displayNotification(notification);

    }
    async function runEmpatica() {
        await TestModule.startEmpatica();
    }
    async function stopEmpatica() {
        await TestModule.stopEmpatica()
    }

    const isDarkMode = useColorScheme() === 'dark';


    useEffect(() => {
        createNotificationChannel()

        var newListener = empaticaEvents.addListener('statusEvent', (event) => {
            switch (event.category) {
                case "connecting":
                    setStatus("Connecting ...");
                    break;
                case "connected":
                    Vibration.vibrate(100);
                    setStatus("Connected");
                    onDisplayNotification(n2);
                    break;
                case "deviceName":
                    setDeviceName(event.value);
                    break;
                case "onWrist":
                    setOnWrist(event.value);
                    if (event.value == "False") {
                        Vibration.vibrate(1000);
                        onDisplayNotification(n2);
                    }
                    else{
                        onDisplayNotification(n3);
                    }
                    break;
                case "disconnected":
                    Vibration.vibrate(1000);
                    setStatus("Disconnected");
                    setDeviceName("No device connected");
                    onDisplayNotification(n1);
                    break;
                case "buttonPress":
                    Vibration.vibrate(200);
                    setLatestTime(event.time);
                    setCount(event.value);
                    break;
                default:
                    break;
                }
        });
        newListener = empaticaEvents.addListener('dataEvent', (event) => {
            switch (event.category) {
                case "ACC":
                    break;
                case "BVP":
                    break;
                case "GSR":
                    break;
                case "IBI":
                    break;
                case "TEMP":
                    setTemperature(event.value)
                    break;
                case "battery":
                    // TODO: display device battery status
                    // Constantly update value.
                    // Is it a status event?
                    break;
                default:
                    break;
                }
        });
        setDataListener(newListener);
        newListener = empaticaEvents.addListener('errorEvent', (event) => {
            switch (event.category) {
                case "launchError":
                    setStatus("Launch error!");
                    break;
                case "authenticationError":
                    setStatus("Failed to authenticate device!");
                    setDeviceName(event.value);
                    break;
                case "randomStupidError":
                    // Handle this
                default:
                    break;
                }
        });
        setErrorListener(newListener);

    }, []);


    checkConnection();
    if (netConnection != true){
        return(<View><Text>No internet connection: {netConnection.toString()}</Text></View>);
    }







    return(
        <View>
            <Text>Try permissions</Text>
            <Button title="Check Permissions" onPress={checkAllPermission} />
            <Button title="Display notification" onPress={() => onDisplayNotification(n1)} />
            <Button title="Connect Device" onPress={runEmpatica} />
            <Button title="Disconnect Device" onPress={stopEmpatica} />
            <Text>Status: {status}</Text>
            <Text>On wrist: {onWrist}</Text>
            <Text>Device: {deviceName}</Text>
            <Text>Temp: {temperature}</Text>
            <Text>ButtonPressCount: {count}</Text>
            <Text>Latest button press: {latestTime}</Text>
        </View>
    );

    // return(<View><Text>Jess</Text></View>);

};


export default App;
