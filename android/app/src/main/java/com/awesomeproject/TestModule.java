package com.awesomeproject; // replace com.your-app-name with your app’s name
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;


import com.empatica.empalink.ConnectionNotAllowedException;
import com.empatica.empalink.EmpaDeviceManager;
import com.empatica.empalink.EmpaticaDevice;
import com.empatica.empalink.config.EmpaSensorStatus;
import com.empatica.empalink.config.EmpaSensorType;
import com.empatica.empalink.config.EmpaStatus;
import com.empatica.empalink.delegate.EmpaDataDelegate;
import com.empatica.empalink.delegate.EmpaStatusDelegate;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.le.ScanCallback;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;



public class TestModule extends ReactContextBaseJavaModule implements EmpaDataDelegate, EmpaStatusDelegate {

    private ReactApplicationContext thecontext = null;
    private Activity theactivity = getCurrentActivity();

    TestModule(ReactApplicationContext reactContext) {
       super(reactContext);
       this.thecontext = reactContext;
    }

    @Override
    public String getName() {
       return "TestModule";
    }

//------------------------------------------------------------------------------------------------------------//


    private void sendEvent(ReactApplicationContext reactContext, String eventName, String params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
        return;
    }
    @ReactMethod
    public void addListener(String eventName) {
        // Set up any upstream listeners or background tasks as necessary
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Remove upstream listeners, stop unnecessary background tasks
    }


//------------------------------------------------------------------------------------------------------------//

    private String EMPATICA_API_KEY = "1fc5ffd1554f4901a77a1d8a08b4130e"; // TODO insert your API Key here

    private EmpaDeviceManager deviceManager = null;
    private int deviceOnWrist = -1;


    @ReactMethod
    public void startEmpatica(){

        if (deviceManager == null){
            initEmpaticaDeviceManager();
        }
    }

    @ReactMethod//(isBlockingSynchronousMethod = true)
    public void stopEmpatica(){

        if (deviceManager != null) {
            deviceManager.disconnect();
        }
    }


    private boolean initEmpaticaDeviceManager() {

        try {
            deviceManager = new EmpaDeviceManager(thecontext, TestModule.this, TestModule.this);
            deviceManager.authenticateWithAPIKey(EMPATICA_API_KEY);
            return true;
        }
        catch(Exception e){
            return false;
        }

    }


    @Override
    public void didDiscoverDevice(EmpaticaDevice bluetoothDevice, String deviceName, int rssi, boolean allowed) {
        // Check if the discovered device can be used with your API key. If allowed is always false,
        // the device is not linked with your API key. Please check your developer area at
        // https://www.empatica.com/connect/developer.php
        sendEvent(thecontext, "EventConnected", "Discovered");
        if (allowed) {
            // Stop scanning. The first allowed device will do.
            deviceManager.stopScanning();
            try {
                // Connect to the device
                deviceManager.connectDevice(bluetoothDevice);

            } catch (ConnectionNotAllowedException e) {
                // This should happen only if you try to connect when allowed == false.

            }
        }
    }

    @Override
    public void didFailedScanning(int errorCode) {

    }
    @Override
    public void didRequestEnableBluetooth() {
        // Request the user to enable Bluetooth
    }

    @Override
    public void bluetoothStateChanged() {
        boolean isBluetoothOn = BluetoothAdapter.getDefaultAdapter().isEnabled();
    }


    @Override
    public void didUpdateSensorStatus(@EmpaSensorStatus int status, EmpaSensorType type) {

        didUpdateOnWristStatus(status);
    }

    @Override
    public void didUpdateStatus(EmpaStatus status) {

        // The device manager is ready for use
        if (status == EmpaStatus.READY) {
            // Start scanning
            sendEvent(thecontext, "EventConnected", "Scanning");
            deviceManager.startScanning();
        }
        else if (status == EmpaStatus.CONNECTED){
            sendEvent(thecontext, "EventConnected", "true");
        }
        else if (status == EmpaStatus.DISCONNECTED){
            sendEvent(thecontext, "EventConnected", "false");
        }
        else if (status == EmpaStatus.CONNECTING){
            sendEvent(thecontext, "EventConnected", "Connecting");
        }
        else if (status == EmpaStatus.DISCONNECTING){
            sendEvent(thecontext, "EventConnected", "Disconnecting");
        }

    }

    @Override
    public void didReceiveAcceleration(int x, int y, int z, double timestamp) {
        sendEvent(thecontext, "EventAcceleration", "true");
    }

    @Override
    public void didReceiveBVP(float bvp, double timestamp) {
        sendEvent(thecontext, "EventBVP", "true");

    }

    @Override
    public void didReceiveBatteryLevel(float battery, double timestamp) {
        sendEvent(thecontext, "EventBattery", "true");

    }

    @Override
    public void didReceiveGSR(float gsr, double timestamp) {
        sendEvent(thecontext, "EventGSR", "true");

    }

    @Override
    public void didReceiveIBI(float ibi, double timestamp) {
        sendEvent(thecontext, "EventIBI", "true");

    }

    @Override
    public void didReceiveTemperature(float temp, double timestamp) {
        sendEvent(thecontext, "EventTemp", "true");
    }

    @Override
    public void didReceiveTag(double timestamp) {
        sendEvent(thecontext, "EventButtonPress", "true");
    }

    @Override
    public void didEstablishConnection() {
        sendEvent(thecontext, "EventConnected", "true");

    }

    @Override
    public void didUpdateOnWristStatus(@EmpaSensorStatus final int status) {

        if (status == EmpaSensorStatus.ON_WRIST) {
            sendEvent(thecontext, "EventOnWristStatus", "true");
        }
        else {
            sendEvent(thecontext, "EventOnWristStatus", "false");
        }

    }

}
