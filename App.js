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

import notifee from '@notifee/react-native';


const requestAllPermission = async () => {

    console.log("Requesting all")
    const os_version = Platform.constants['Release'];
    var result1 = false;
    var result2 = false;


    if (os_version < 12){
        try {
            const granted2 = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );

            result1 = true;
            result2 =  await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        }
        catch (err) {
            console.warn(err);
        }
    }
    else {
        try {
            const granted1 = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
            );
            const granted2 = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
            );
            result1 =  await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
            result2 =  await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);

        }
        catch (err) {
            console.warn(err);
            return false;
        }
    }

    if (result1 && result2) {
        console.log("version "+os_version+". All permissions granted.");
        return true;
    }
    else {
        console.log("version "+os_version+". You don't have all permissions!");
        return false;
    }


};

var eventListener1 = null;
var eventListener2 = null;
var eventListener3 = null;
var eventListener4 = null;
var eventListener5 = null;
var eventListener6 = null;
var eventListener7 = null;





const App: () => Node = () => {

    // handling app events when app is not in focus
    // See: https://notifee.app/react-native/docs/events
    notifee.onBackgroundEvent(async ({type, detail}) => {

    });


    async function DisplayNotConnectedNotification(input) {

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        console.log("NOTIFICATION");
        // Display a notification
        await notifee.displayNotification({
            title: 'Device disconnected',
            body: 'Reconnect device to resume monitoring.',
            android: {
                ongoing: true,
                channelId,
                // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
                // pressAction is needed if you want the notification to open the app when pressed
                pressAction: {
                    id: 'default',
                },
            },
        });
        return true;

    };

    const [ext_temp_events, setExt_temp_events] = useState(0);
    const [int_temp_events, setInt_temp_events] = useState(0);

    const [netConnection, setNetConnection] = useState(false);
    const [onWrist, setOnWrist] = useState("false");
    const [status, setStatus] = useState("Not connected");
    const [deviceName, setDeviceName] = useState("No device connected");
    const [temperature, setTemperature] = useState("-1");
    const [count, setCount] = useState(0);
    const [latestTime, setLatestTime] = useState("");
    const [init, setInit]= useState(true);

    NetInfo.fetch().then(state => setNetConnection(state.isConnected));

    const empaticaEvents = new NativeEventEmitter(NativeModules.ToastExample);


    if(init){
        eventListener1 = empaticaEvents.addListener('EventOnWrist', (event) => {setOnWrist(event);});
        eventListener2 = empaticaEvents.addListener('EventStatus', (event) => {setStatus(event);});
        eventListener3 = empaticaEvents.addListener('EventButtonPress', (event) => {
            Vibration.vibrate(200);
            // DisplayNotification();
            setLatestTime(event);
        });
        setInit(false);
        eventListener4 = empaticaEvents.addListener('EventTemperature', (event) => {setTemperature(event);});
        eventListener5 = empaticaEvents.addListener('EventNewDevice', (event) => {setDeviceName(event);});
        eventListener6 = empaticaEvents.addListener('EventButtonPressCount', (event) => {setCount(event);});
        eventListener7 = empaticaEvents.addListener('EventDisconnected', (event) => {

            DisplayNotConnectedNotification();
        });
    }


    function runEmpatica() {
        try{
            TestModule.startEmpatica();
        }
        catch (err) {
            console.warn(err);
            console.log("Failed to launch");
        }
    }
    function stopEmpatica() {
        try{
            TestModule.stopEmpatica()
        }
        catch (err) {
            console.warn(err);
            console.log("Failed to stop");
        }
    }


    const isDarkMode = useColorScheme() === 'dark';
    if (!netConnection){
        return(<View><Text>No internet connection: netConnection={netConnection.toString()}</Text></View>);
    }
    else{
        return(
            <View>
                <Text>Try permissions</Text>
                <Button title="Request Permissions" onPress={requestAllPermission} />
                <Button title="Connect Device" onPress={runEmpatica} />
                <Button title="Disconnect Device" onPress={stopEmpatica} />
                <Button title="Display notification" onPress={() => DisplayNotification()} />
                <Text>Status: {status}</Text>
                <Text>On wrist: {onWrist}</Text>
                <Text>Device: {deviceName}</Text>
                <Text>Temp: {temperature}</Text>
                <Text>ButtonPressCount: {count}</Text>
                <Text>Latest button press: {latestTime}</Text>
            </View>
            );
    }
};


export default App;
