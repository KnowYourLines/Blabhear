import React, {useState} from 'react';
import {
  View,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';

import Sound from 'react-native-sound';
import Button from './Button';
import InCallManager from 'react-native-incall-manager';

export default ({navigation}) => {
  const [isNear, setIsNear] = useState(false);
  const [track, setTrack] = useState(null);
  const [playTime, setPlayTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [isPlaying, setIsPlaying] = useState(true);
  const onStartPlay = async e => {
    setIsPlaying(true);
    track.play();
  };
  onPausePlay = async () => {
    setIsPlaying(false);
    track.pause();
  };
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
        <View style={styles.viewPlayer}>
          <View style={styles.playBtnWrapper}>
            <Button
              onPress={isPlaying ? onPausePlay : onStartPlay}
              title={isPlaying ? 'Pause' : 'Play'}></Button>
          </View>
        </View>
      </View>
    );
  } else {
    return <View></View>;
  }
};

const styles = StyleSheet.create({
  viewPlayer: {
    marginTop: 60,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  playBtnWrapper: {
    flexDirection: 'row',
    marginTop: 40,
  },
});
