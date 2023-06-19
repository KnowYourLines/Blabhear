import React, {useState} from 'react';
import {
  View,
  DeviceEventEmitter,
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
} from 'react-native';

import Sound from 'react-native-sound';
import Button from './Button';
import InCallManager from 'react-native-incall-manager';

export default ({navigation}) => {
  const [isNear, setIsNear] = useState(false);
  React.useEffect(() => {
    InCallManager.start();
    if (Platform.OS == 'android') {
      Sound.setCategory('Voice');
      const requestPermissions = async () => {
        try {
          const grants = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);

          console.log('write external stroage', grants);

          if (
            !(
              grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
                PermissionsAndroid.RESULTS.GRANTED &&
              grants['android.permission.READ_EXTERNAL_STORAGE'] ===
                PermissionsAndroid.RESULTS.GRANTED &&
              grants['android.permission.RECORD_AUDIO'] ===
                PermissionsAndroid.RESULTS.GRANTED
            )
          ) {
            Alert.alert('Missing permissions to record and save audio', '', [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Go to Settings',
                onPress: () => Linking.openSettings(),
              },
            ]);
          }
        } catch (err) {
          console.warn(err);
        }
      };
      requestPermissions();
    } else {
      Sound.setCategory('Playback');
    }
  }, []);

  DeviceEventEmitter.addListener('Proximity', function (data) {
    setIsNear(data['isNear']);
  });
  if (!isNear) {
    return (
      <View style={{marginTop: '25%'}}>
        <Button
          title="Back"
          onPress={() => {
            InCallManager.stop();
            navigation.goBack();
          }}
        />
      </View>
    );
  } else {
    return <View></View>;
  }
};
