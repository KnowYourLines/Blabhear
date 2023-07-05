import React, {useState} from 'react';
import {
  View,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import Slider from '@react-native-community/slider';

import Sound from 'react-native-sound';
import Button from './Button';
import InCallManager from 'react-native-incall-manager';

export default ({navigation}) => {
  const [isNear, setIsNear] = useState(false);
  const [track, setTrack] = useState(null);
  const [playSeconds, setPlaySeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderEditing, setSliderEditing] = useState(false);
  const [timeout, setTimeout] = useState(null);
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
          setDuration(track.getDuration());
        }
      },
    );
    setTimeout(
      setInterval(() => {
        if (track && track.isLoaded() && isPlaying && !sliderEditing) {
          track.getCurrentTime((seconds, trackIsPlaying) => {
            setPlaySeconds(seconds);
          });
        }
      }, 100),
    );
  }, []);
  const onSliderEditStart = () => {
    setSliderEditing(true);
  };
  const onSliderEditEnd = () => {
    setSliderEditing(false);
  };
  const onSliderEditing = value => {
    if (track) {
      track.setCurrentTime(value);
      setPlaySeconds(value);
    }
  };
  const getAudioTimeString = seconds => {
    const h = parseInt(seconds / (60 * 60));
    const m = parseInt((seconds % (60 * 60)) / 60);
    const s = parseInt(seconds % 60);

    return (
      (h < 10 ? '0' + h : h) +
      ':' +
      (m < 10 ? '0' + m : m) +
      ':' +
      (s < 10 ? '0' + s : s)
    );
  };
  const currentTimeString = getAudioTimeString(playSeconds);
  const durationString = getAudioTimeString(duration);
  DeviceEventEmitter.addListener('Proximity', function (data) {
    setIsNear(data['isNear']);
  });
  if (!isNear) {
    return (
      <View>
        <Button
          title="Back"
          onPress={() => {
            InCallManager.stop();
            navigation.goBack();
            track.pause();
            track.release();
            if (timeout) {
              clearInterval(timeout);
            }
          }}
        />
        <View
          style={{
            marginTop: "25%",
            marginVertical: 15,
            marginHorizontal: 15,
            flexDirection: 'row',
          }}>
          <Text style={{color: 'white', alignSelf: 'center'}}>
            {currentTimeString}
          </Text>
          <Slider
            onTouchStart={onSliderEditStart}
            onTouchEnd={onSliderEditEnd}
            onValueChange={onSliderEditing}
            value={playSeconds}
            maximumValue={duration}
            maximumTrackTintColor="gray"
            minimumTrackTintColor="white"
            thumbTintColor="white"
            style={{
              flex: 1,
              alignSelf: 'center',
              marginHorizontal: Platform.select({ios: 5}),
            }}
          />
          <Text style={{color: 'white', alignSelf: 'center'}}>
            {durationString}
          </Text>
        </View>
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
