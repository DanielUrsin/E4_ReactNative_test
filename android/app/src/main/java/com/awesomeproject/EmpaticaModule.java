package com.awesomeproject; // replace com.your-app-name with your app’s name
import static android.provider.Settings.System.getString;

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
import com.facebook.react.bridge.Callback;

import com.empatica.empalink.ConnectionNotAllowedException;
import com.empatica.empalink.EmpaDeviceManager;
import com.empatica.empalink.EmpaticaDevice;
import com.empatica.empalink.config.EmpaSensorStatus;
import com.empatica.empalink.config.EmpaSensorType;
import com.empatica.empalink.config.EmpaStatus;
import com.empatica.empalink.delegate.EmpaDataDelegate;
import com.empatica.empalink.delegate.EmpaStatusDelegate;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.NotificationManager;
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
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.app.NotificationCompat;



public class EmpaticaModule extends ReactContextBaseJavaModule implements EmpaDataDelegate, EmpaStatusDelegate {

    private static final String CHANNEL_ID = "1";
    private ReactApplicationContext reactContext = null;
    //private Activity theactivity = getCurrentActivity();


    // Data state
    private int buttonPressCount = 0;
    private String deviceName = "None";
    private boolean connection = false;
    private boolean onWrist = false;

    EmpaticaModule(ReactApplicationContext reactContext) {
       super(reactContext);
       this.reactContext = reactContext;
    }

    @Override
    public String getName() {
       return "EmpaticaConnector";
    }

//------------------------------------------------------------------------------------------------------------//


    private void sendEvent(ReactApplicationContext reactContext, String eventName, WritableMap params) {
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

//------------------------------------------------------------------------------------------------------------//

    private String EMPATICA_API_KEY = "1fc5ffd1554f4901a77a1d8a08b4130e";

    private EmpaDeviceManager deviceManager = null;
    private int deviceOnWrist = -1;
    
    @ReactMethod
    public void startEmpatica(){
        try {
            WritableMap payload = Arguments.createMap();
            payload.putString("category", "connecting");
            sendEvent(reactContext, "statusEvent", payload);
            if (deviceManager == null){
                deviceManager = new EmpaDeviceManager(reactContext, EmpaticaModule.this, EmpaticaModule.this);
                deviceManager.authenticateWithAPIKey(EMPATICA_API_KEY);
            }
        }
        catch(Exception e){
            WritableMap payload = Arguments.createMap();
            payload.putString("category", "launchError");
            payload.putString("message", "Empatica system launch failed.");
            sendEvent(reactContext, "errorEvent", payload);
        }
    }


    @ReactMethod
    public void stopEmpatica(){

        if (deviceManager != null) {
            deviceManager.disconnect();
            deviceManager = null;
        }
        this.connection = false;
        this.deviceName = "None";
        this.onWrist = false;
    }

    @ReactMethod
    public void getStatus(Callback callback) {
        WritableMap payload = Arguments.createMap();
        payload.putString("deviceName", this.deviceName);
        payload.putBoolean("connection", this.connection);
        payload.putBoolean("onWrist", this.onWrist);
        payload.putInt("buttonPressCount", this.buttonPressCount);
        callback.invoke(payload);
        // void putNull(@NonNull String key);
        // void putBoolean(@NonNull String key, boolean value);
        // void putDouble(@NonNull String key, double value);
        // void putInt(@NonNull String key, int value);
        // void putString(@NonNull String key, @Nullable String value);
        // void putArray(@NonNull String key, @Nullable ReadableArray value);
        // void putMap(@NonNull String key, @Nullable ReadableMap value);
        // void merge(@NonNull ReadableMap source);
    }


    @Override
    public void didDiscoverDevice(EmpaticaDevice bluetoothDevice, String deviceName, int rssi, boolean allowed) {

        WritableMap payload = Arguments.createMap();
        try {
            deviceManager.stopScanning();
            if (!allowed){
                throw new ConnectionNotAllowedException("Not authorized");
            }
            deviceManager.connectDevice(bluetoothDevice);
            payload.putString("category", "deviceName");
            payload.putString("value", deviceName);
            sendEvent(reactContext, "statusEvent", payload);
            this.deviceName = deviceName;

        } catch (ConnectionNotAllowedException e) {
            payload.putString("category", "authenticationError");
            payload.putString("value", deviceName);
            sendEvent(reactContext, "errorEvent", payload);
        }
    }


    @Override
    public void didUpdateStatus(EmpaStatus status) {

        WritableMap payload = Arguments.createMap();
        if (status == EmpaStatus.READY) {
            deviceManager.startScanning();
            payload.putString("category", "connecting");
            sendEvent(reactContext, "statusEvent", payload);
        }
        else if (status == EmpaStatus.CONNECTED){
            payload.putString("category", "connected");
            sendEvent(reactContext, "statusEvent", payload);
            this.connection = true;
        }
        else if (status == EmpaStatus.DISCONNECTED){
            payload.putString("category", "disconnected");
            sendEvent(reactContext, "statusEvent", payload);
            this.stopEmpatica();
        }
        else if (status == EmpaStatus.CONNECTING){
        }
        else if (status == EmpaStatus.DISCONNECTING){
        }

    }

    @Override
    public void didUpdateOnWristStatus(@EmpaSensorStatus final int status) {

        WritableMap payload = Arguments.createMap();
        payload.putString("category", "onWrist");

        if (status == EmpaSensorStatus.ON_WRIST) {
            payload.putString("value", "True");
            this.onWrist = true;
        }
        else {
            payload.putString("value", "False");
            this.onWrist = false;
        }
        sendEvent(reactContext, "statusEvent", payload);
    }


    @Override
    public void didFailedScanning(int errorCode) {
    }
    @Override
    public void didRequestEnableBluetooth() {
    }
    @Override
    public void bluetoothStateChanged() {
    }
    @Override
    public void didUpdateSensorStatus(@EmpaSensorStatus int status, EmpaSensorType type) {
        didUpdateOnWristStatus(status);
    }
    @Override
    public void didReceiveAcceleration(int x, int y, int z, double timestamp) {
        WritableMap payload = Arguments.createMap();
        payload.putString("category", "ACC");
        payload.putString("x", Integer.toString(x));
        payload.putString("y", Integer.toString(y));
        payload.putString("z", Integer.toString(z));
        payload.putString("timestamp", Double.toString(timestamp));
        sendEvent(reactContext, "dataEvent", payload);
    }
    @Override
    public void didReceiveBVP(float bvp, double timestamp) {
    }
    @Override
    public void didReceiveBatteryLevel(float battery, double timestamp) {
    }
    @Override
    public void didReceiveGSR(float gsr, double timestamp) {
    }
    @Override
    public void didReceiveIBI(float ibi, double timestamp) {
    }
    @Override
    public void didReceiveTemperature(float temp, double timestamp) {
        WritableMap payload = Arguments.createMap();
        payload.putString("category", "ACC");
        payload.putString("value", Float.toString(temp));
        payload.putString("timestamp", Double.toString(timestamp));
        sendEvent(reactContext, "dataEvent", payload);
    }
    @Override
    public void didReceiveTag(double timestamp) {
        this.buttonPressCount += 1;
        WritableMap payload = Arguments.createMap();
        payload.putString("category", "buttonPress");
        payload.putString("value", String.valueOf(this.buttonPressCount));
        payload.putString("timestamp", Double.toString(timestamp));
        sendEvent(reactContext, "statusEvent", payload);
    }
    @Override
    public void didEstablishConnection() {
        WritableMap payload = Arguments.createMap();
        payload.putString("category", "connected");
        sendEvent(reactContext, "statusEvent", payload);
        this.connection = true;
    }
}
