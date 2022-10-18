/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
const { TestModule } = NativeModules;
import { NativeEventEmitter } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import React, {useState, useEffect, Component} from 'react';
import type {Node} from 'react';
import { Text,
         Button,
         View,
         NativeModules,
         Vibration,
         useColorScheme,
         PermissionsAndroid } from 'react-native';



const requestAllPermission = async () => {

    console.log("Requesting all")
    try {
        const granted1 = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
        const granted2 = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );

    }
    catch (err) {
        console.warn(err);
    }
    var result1 =  await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
    var result2 =  await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
    if (result1 && result2) {
        console.log("All granted");
        return true;
    }
    else {
        console.log("You don't have all permissions!");
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
            løk++;
            console.log(løk);
            console.log("løk");
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
