import React, {useState, useContext} from 'react';
import {View, Text, DeviceEventEmitter, StyleSheet} from 'react-native';

import Sound from 'react-native-sound';
import Button from './Button';
import {ConnectedContext} from '../context/ConnectedContext';
import InCallManager from 'react-native-incall-manager';

export default ({navigation}) => {
  const connectedState = useContext(ConnectedContext);
  const [isNear, setIsNear] = useState(false);
  const [track, setTrack] = useState(null);
  React.useEffect(() => {
    Sound.setCategory('Voice');
    const track = new Sound(
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      null,
      e => {
        if (e) {
          console.log('error loading track:', e);
        } else {
          track.setVolume(1);
          track.play();
          setTrack(track);
        }
      },
    );
  }, []);

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
      <View style={{marginTop: '25%'}}>
        <Button
          title="Back"
          onPress={() => {
            InCallManager.stop();
            navigation.goBack();
            track.pause();
            track.release();
          }}
        />
      </View>
    );
  } else {
    return <View></View>;
  }
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 20,
    color: 'white',
  },
});
