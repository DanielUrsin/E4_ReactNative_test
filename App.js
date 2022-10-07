/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
const { TestModule } = NativeModules;
import React, {useState, useEffect} from 'react';
import type {Node} from 'react';
import { Text,
         Button,
         View,
         NativeModules,
         Vibration,
         useColorScheme,
         PermissionsAndroid } from 'react-native';

import { NativeEventEmitter } from 'react-native';

import NetInfo from "@react-native-community/netinfo";





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



const App: () => Node = () => {

    var setup = true;

    const [netConnection, setNetConnection] = useState(false);
    NetInfo.fetch().then(state => setNetConnection(state.isConnected));

    const [onWrist, setOnWrist] = useState(false);
    const [connected, setConnected] = useState(false);


    if(setup){
        const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
        this.eventListener = eventEmitter.addListener('EventOnWristStatus', (event) => {
            setOnWrist(event);
        });
        this.eventListener = eventEmitter.addListener('EventConnected', (event) => {
            setConnected(event);
        });
        this.eventListener = eventEmitter.addListener('EventButtonPress', (event) => {
            Vibration.vibrate(200);
        });
        setup = false;
    }

    function runEmpatica() {
        try{
            console.log("Launching");
            var a = TestModule.startEmpatica();
            console.log("Connected");

        }
        catch (err) {
            console.warn(err);
            console.log("Failed to launch");
        }
    }
    function stopEmpatica() {
        try{
            TestModule.stopEmpatica()
            console.log("Stopped");
        }
        catch (err) {
            console.warn(err);
            console.log("Failed to stop");
        }
    }







    const isDarkMode = useColorScheme() === 'dark';

    const { TestModule } = NativeModules;
    var output = "";
    if (!netConnection){
        output = (<View><Text>No internet connection: netConnection={netConnection.toString()}</Text></View>);
    }
    else{
        output = (
            <View>
            <Text>Try permissions</Text>
            <Button title="Request Permissions" onPress={requestAllPermission} />
            <Button title="Connect Device" onPress={runEmpatica} />
            <Button title="Disconnect Device" onPress={stopEmpatica} />
            <Text>Connected: {connected.toString()}</Text>
            <Text>On wrist: {onWrist.toString()}</Text>



            </View>
            );
    }


    return output;
};


export default App;
