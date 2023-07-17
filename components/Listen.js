import React, {useState, useContext} from 'react';
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
import {RoomWsContext} from '../context/RoomWsContext';

export default ({navigation, route}) => {
  const [isNear, setIsNear] = useState(false);
  const [track, setTrack] = useState(null);
  const [playSeconds, setPlaySeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderEditing, setSliderEditing] = useState(false);
  const [timeout, setTimeout] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const roomWsState = useContext(RoomWsContext);
  const onStartPlay = async e => {
    setIsPlaying(true);
    track.play(completed => {
      if (completed) {
        setIsPlaying(false);
      } else {
        console.log('playback failed due to audio decoding errors');
      }
    });
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
    const recording = new Sound(route.params.soundUrl, null, e => {
      if (e) {
        console.log('error loading track:', e);
      } else {
        recording.setVolume(1);
        recording.play(completed => {
          if (completed) {
            setIsPlaying(false);
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
        setTrack(recording);
        setDuration(recording.getDuration());
      }
    });
    setTimeout(
      setInterval(() => {
        recording.getCurrentTime((seconds, recordingIsPlaying) => {
          if (recordingIsPlaying && !sliderEditing) {
            setPlaySeconds(seconds);
          }
        });
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
            marginTop: '25%',
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
          <View style={styles.reportBtnWrapper}>
            <Button
              onPress={() => {
                roomWsState.roomWs.send(
                  JSON.stringify({
                    command: 'report_message_notification',
                    message_notification_id: route.params.messageNotificationId
                  }),
                );
                InCallManager.stop();
                navigation.goBack();
                track.pause();
                track.release();
                if (timeout) {
                  clearInterval(timeout);
                }
              }}
              title="Report Abuse"></Button>
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
  reportBtnWrapper: {
    flexDirection: 'row',
    marginTop: 80,
  },
});
