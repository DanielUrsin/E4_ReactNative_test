/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useState, useEffect, Component} from 'react';
const { EmpaticaModule } = NativeModules;
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

    const [channelId, setChannelId] = useState(null);
    const [currMsg, setCurrMsg] = useState(null)

    const [statusEventListener, setStatusListener] = useState(null);
    const [dataEventListener, setDataListener] = useState(null);
    const [errorEventListener, setErrorListener] = useState(null);

    const [onWrist, setOnWrist] = useState("false");
    const [deviceStatus, setDeviceStatus] = useState("Not connected");
    const [deviceName, setDeviceName] = useState("No device connected");
    const [temperature, setTemperature] = useState("-1");
    const [count, setCount] = useState(0);
    const [latestTime, setLatestTime] = useState("");

    const [permissionStatus, setPermissionStatus] = useState(false);
    const [internetStatus, setInternetStatus] = useState(false);

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
            asForegroundService: true,
            ongoing: true,
            color: AndroidColor.YELLOW,
            colorized: true,
            channelId:"MainNotification",
            smallIcon: 'ic_status_connected', // optional, defaults to 'ic_launcher'.
            // pressAction is needed if you want the notification to open the app when pressed
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
    var n3 = {
        id:"123",
        title: 'All good!',
        body: 'Device connected and recording data.',
        android: {
            asForegroundService: true,
            ongoing: true,
            color: AndroidColor.GREEN,
            colorized: true,
            channelId:"MainNotification",
            smallIcon: 'ic_status_onwrist', // optional, defaults to 'ic_launcher'.
            // pressAction is needed if you want the notification to open the app when pressed
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

    async function checkPermissions() {

        var permissions = [
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        ]

        const os_version = Platform.constants['Release'];

        if (os_version < 12){
            permissions = [
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ]
        }
        var allGranted = true;
        var results = await PermissionsAndroid.requestMultiple(permissions,
            {
                title: 'All needed permissions',
                message: "All mentioned permissions are needed for proper app function",
                buttonPositive: 'OK'
            }
        );
        for (var i = 0; i < permissions.length; i++) {
            var p = permissions[i];
            var r = results[p];
            allGranted &&= (results[p] === PermissionsAndroid.RESULTS.GRANTED);
            console.log(p.toString()+": "+r.toString());
        }
        await setPermissionStatus(allGranted);
        return allGranted;

    }

    async function checkConnection() {
        var status = await NetInfo.fetch();
        console.log("Checked connection")
        await setInternetStatus(status.isConnected);
        return status.isConnected;
    };

    async function createNotificationChannel() {
        var newChannel = await notifee.createChannel({
            id: 'MainNotification',
            name: 'Channel',
            // vibrationPattern: [300, 500],
            vibration: false,
        });
        await setChannelId(newChannel);
        await onDisplayNotification(n1);
    }

    async function onDisplayNotification(notification) {
        await notifee.displayNotification(notification);
        return true;
    }
    async function runEmpatica() {
        await EmpaticaModule.startEmpatica();
    }
    async function stopEmpatica() {
        await EmpaticaModule.stopEmpatica()
    }
    async function getEmpaticaStatus() {
        EmpaticaModule.getStatus((state) => {
            setDeviceName(state.deviceName);
            setDeviceStatus(state.connection);
            setOnWrist(state.onWrist);
            setCount(state.buttonPressCount);
            console.log(state);
        });
    }

    useEffect(() => {

        checkPermissions();
        createNotificationChannel();

        var newListener = empaticaEvents.addListener('statusEvent', (event) => {
            switch (event.category) {
                case "connecting":
                    setDeviceStatus("Connecting ...");
                    break;
                case "connected":
                    Vibration.vibrate(100);
                    setDeviceStatus("Connected");
                    onDisplayNotification(n2);
                    break;
                case "deviceName":
                    setDeviceName(event.value);
                    break;
                case "onWrist":
                    setOnWrist(event.value);
                    if (event.value == "False") {
                        onDisplayNotification(n2);
                    }
                    else{
                        onDisplayNotification(n3);
                    }
                    break;
                case "disconnected":
                    Vibration.vibrate(1000);
                    setDeviceStatus("Disconnected");
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
                    setDeviceStatus("Launch error!");
                    break;
                case "authenticationError":
                    setDeviceStatus("Failed to authenticate device!");
                    setDeviceName(event.value);
                    break;
                case "randomStupidError":
                    // Handle this
                default:
                    break;
                }

        });
        setErrorListener(newListener);
        return notifee.onForegroundEvent(({ type, detail }) => {
            switch (type) {
                case EventType.DISMISSED:
                    console.log('User dismissed notification', detail.notification);
                    break;
                case EventType.PRESS:
                    console.log('User pressed notification', detail.notification);
                    break;
            }
        });

    }, []);


    return(
        <View>
            <Text>Try permissions</Text>
            <Button title="Display notification" onPress={() => onDisplayNotification(n1)} />
            <Button title="Connect Device" onPress={runEmpatica} />
            <Button title="Disconnect Device" onPress={stopEmpatica} />
            <Button title="Get Status" onPress={getEmpaticaStatus} />
            <Text>Status: {deviceStatus.toString()}</Text>
            <Text>On wrist: {onWrist.toString()}</Text>
            <Text>Device: {deviceName}</Text>
            <Text>Temp: {temperature}</Text>
            <Text>ButtonPressCount: {count}</Text>
            <Text>Latest button press: {latestTime}</Text>
            <Text>Internet connection: {internetStatus.toString()}</Text>
            <Text>Permissions: {permissionStatus.toString()}</Text>
        </View>
    );
};


export default App;
