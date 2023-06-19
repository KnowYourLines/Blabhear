import React, {useState} from 'react';
import {View, DeviceEventEmitter, Platform} from 'react-native';

import Sound from 'react-native-sound';
import Button from './Button';
import InCallManager from 'react-native-incall-manager';

export default ({navigation}) => {
  const [isNear, setIsNear] = useState(false);
  const [track, setTrack] = useState(null);
  React.useEffect(() => {
    InCallManager.start();
    if (Platform.OS == 'android') {
      Sound.setCategory('Voice');
    } else {
      Sound.setCategory('Playback');
    }
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
