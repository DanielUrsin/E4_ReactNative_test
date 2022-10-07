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

const CheckInternetConnection = async () => {
    var stat = 0;
    NetInfo.fetch().then(state => {
        if (state.isConnected){
            stat = 1;
        }
        console.log("Is connected?", state.isConnected);

    });

    return stat;


}

const App: () => Node = () => {



    const [netConnection, setNetConnection] = useState(false);
    NetInfo.fetch().then(state => setNetConnection(state.isConnected));

    const [onWrist, setOnWrist] = useState(false);
    const [connected, setConnected] = useState(false);


    if(this.eventListener != null){
        this.eventListener.remove();
    }
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    this.eventListener = eventEmitter.addListener('EventOnWristStatus', (event) => {
        setOnWrist(event);
    });
    this.eventListener = eventEmitter.addListener('EventConnected', (event) => {
        setConnected(event);
        console.log(event.toString())
    });

    function runEmpatica() {
        try{
            var a = false;
            a = TestModule.startEmpatica();
            console.log(true);
            return a;
        }
        catch (err) {
            console.warn(err);
            console.log(false);
            return false;
        }
    }
    const checkStatus = async () =>{
        var status = await TestModule.getStatus();
        if (status == 1){
            status = "On wrist";
        }
        else{
            status = "Not on wrist";
        }
        console.log(status);
    }






    const isDarkMode = useColorScheme() === 'dark';

    const { TestModule } = NativeModules;
    var output = "";
    if (!netConnection){
        output = (<View><Text>No internet connection.{netConnection.toString()}</Text></View>);
    }
    else{
        output = (
            <View>
            <Text>Try permissions</Text>
            <Button title="Request Permissions" onPress={requestAllPermission} />
            <Button title="Connect Device" onPress={runEmpatica} />
            <Button title="Check Status" onPress={checkStatus} />
            <Text>Connected: {connected.toString()}</Text>
            <Text>On wrist: {onWrist.toString()}</Text>



            </View>
            );
    }


    return output;
};


export default App;
