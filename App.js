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
    var result1 = null;
    var result2 = null;
    var result3 = null;

    if (os_version < 12){
        try {
            // const granted1 = await PermissionsAndroid.request(
            //     PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
            // );
            const granted2 = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            // const granted3 = await PermissionsAndroid.request(
            //     PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
            // );
            result1 = true;
            result3 = true;

            // result1 =  await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
            result2 =  await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            // result3 =  await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);

        }
        catch (err) {
            console.warn(err);
        }
    }
    else {
        result3 = true;
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
        }
    }

    if (result1 && result2 && result3) {
        console.log("version "+os_version+". All granted");
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





const App: () => Node = () => {

    async function DisplayNotification() {

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        console.log("NOTIFICATION");
        // Display a notification
        await notifee.displayNotification({
            title: 'Notification Title',
            body: 'Main body content of the notification',
            android: {
                channelId,
                // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
                // pressAction is needed if you want the notification to open the app when pressed
                pressAction: {
                    id: 'default',
                },
            },
        });

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
    var løk = 0;

    NetInfo.fetch().then(state => setNetConnection(state.isConnected));

    const empaticaEvents = new NativeEventEmitter(NativeModules.ToastExample);


    if(init){
        eventListener1 = empaticaEvents.addListener('EventOnWrist', (event) => {setOnWrist(event);});
        eventListener2 = empaticaEvents.addListener('EventStatus', (event) => {setStatus(event);});
        eventListener4 = empaticaEvents.addListener('EventTemperature', (event) => {setTemperature(event);});
        eventListener5 = empaticaEvents.addListener('EventNewDevice', (event) => {setDeviceName(event);});
        eventListener6 = empaticaEvents.addListener('EventButtonPressCount', (event) => {setCount(event);});
        eventListener3 = empaticaEvents.addListener('EventButtonPress', (event) => {
            Vibration.vibrate(200);
            setLatestTime(event);
        });
        setInit(false);
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
