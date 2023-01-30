/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import notifee, { EventType } from '@notifee/react-native';
import {name as appName} from './app.json';


notifee.registerForegroundService((notification, løk) => {

    return new Promise(() => {
        // Long running task...
        notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'stop') {
                notifee.stopForegroundService()
            }
        });
        notifee.onBackgroundEvent(({ type, detail }) => {});
    });
});



AppRegistry.registerComponent(appName, () => App);
