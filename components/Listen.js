import React, {useState, useContext} from 'react';
import {View, Text, DeviceEventEmitter} from 'react-native';

import Button from './Button';
import {ConnectedContext} from '../context/ConnectedContext';
import InCallManager from 'react-native-incall-manager';

export default ({navigation}) => {
  const connectedState = useContext(ConnectedContext);
  const [isNear, setIsNear] = useState(false);

  DeviceEventEmitter.addListener('Proximity', function (data) {
    setIsNear(data['isNear']);
  });
  React.useEffect(() => {
    InCallManager.start();
  }, []);
  if (!connectedState.connected) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenText}>Can't connect to Blabhear</Text>
      </View>
    );
  }
  if (!isNear) {
    return (
      <View style>
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
