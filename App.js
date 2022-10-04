/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
const { TestModule } = NativeModules;
import React from 'react';
import type {Node} from 'react';
import { Text,
         Button,
         useEffect,
         useState,
         useColorScheme,
         View,
         NativeModules,
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



}


const App: () => Node = () => {
    // var stat = false;
    // NetInfo.fetch().then(state => {
    //     stat = state.isConnected;
    // });
    // if (!stat){
    //     return (<View><Text>No internet connection.</Text></View>);
    // }
    var count = 0;

    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    this.eventListener = eventEmitter.addListener('EventOnWristStatus', (event) => {
        // count++;
        console.log(event.status) // "someValue"
        // console.log(count) // "someValue"

    });

    var EMPATICA_API_KEY = "1fc5ffd1554f4901a77a1d8a08b4130e"; // TODO insert your API Key here

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

    var output = (
          <View>
                <Text>Try permissions</Text>
                <Button title="Request Permissions" onPress={requestAllPermission} />
                <Button title="Connect Device" onPress={runEmpatica} />
                <Button title="Check Status" onPress={checkStatus} />

          </View>
      );

    return output;
};


export default App;
