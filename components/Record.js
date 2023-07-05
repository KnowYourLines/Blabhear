import React, {useState, useCallback} from 'react';
import {
  View,
  DeviceEventEmitter,
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
  StyleSheet,
  Text,
} from 'react-native';
import Slider from '@react-native-community/slider';

import Sound from 'react-native-sound';
import Button from './Button';
import InCallManager from 'react-native-incall-manager';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';

import RNFS from 'react-native-fs';

export default ({navigation}) => {
  const [isNear, setIsNear] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [track, setTrack] = useState(null);
  const [playSeconds, setPlaySeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderEditing, setSliderEditing] = useState(false);
  const [timeout, setTimeout] = useState(null);
  const [uri, setUri] = useState('');
  const [audioRecorderPlayer, setAudioRecorderPlayer] = useState(
    new AudioRecorderPlayer(),
  );
  audioRecorderPlayer.setSubscriptionDuration(0.1);
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
  const onStopPlay = async () => {
    setIsPlaying(false);
    track.pause();
    track.release();
    if (timeout) {
      clearInterval(timeout);
    }
  };
  const onStartRecord = useCallback(async () => {
    setIsRecording(true);
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };

    console.log('audioSet', audioSet);
    if (isPlaying) {
      await onStopPlay();
    }

    const uri = await audioRecorderPlayer.startRecorder(
      Platform.select({
        ios: undefined,
        android: undefined,
      }),
      audioSet,
    );

    audioRecorderPlayer.addRecordBackListener(e => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
    });
    console.log(`uri: ${uri}`);
    setUri(uri);
  }, []);
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
    const startRecord = async () => {
      await onStartRecord();
    };

    startRecord(); // run it, run it
  }, [onStartRecord]);

  DeviceEventEmitter.addListener('Proximity', function (data) {
    setIsNear(data['isNear']);
  });
  const onStopRecord = async () => {
    setIsRecording(false);
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    const recording = new Sound(result, null, e => {
      if (e) {
        console.log('error loading track:', e);
      } else {
        recording.setVolume(1);
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
  };
  const onPausePlay = async () => {
    setIsPlaying(false);
    track.pause();
  };
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
  if (!isNear) {
    if (isRecording) {
      return (
        <View>
          <Button
            title="Back"
            onPress={async () => {
              RNFS.exists(uri)
                .then(result => {
                  if (result) {
                    return RNFS.unlink(uri)
                      .then(() => {
                        console.log('FILE DELETED');
                      })
                      .catch(err => {
                        console.log(err.message);
                      });
                  }
                })
                .catch(err => {
                  console.log(err.message);
                });
              await onStopRecord();
              InCallManager.stop();
              navigation.goBack();
            }}
          />
          <Text style={styles.titleTxt}>Recording</Text>
          <Text style={styles.txtRecordCounter}>{recordTime}</Text>
          <View style={styles.viewRecorder}>
            <View style={styles.recordBtnWrapper}>
              <Button onPress={onStopRecord} title="Stop"></Button>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View>
          <Button
            title="Back"
            onPress={async () => {
              RNFS.exists(uri)
                .then(result => {
                  console.log('file found');
                  console.log(result);
                  if (result) {
                    return RNFS.unlink(uri)
                      .then(() => {
                        console.log('FILE DELETED');
                      })
                      .catch(err => {
                        console.log(err.message);
                      });
                  }
                })
                .catch(err => {
                  console.log(err.message);
                });
              await onStopPlay();
              InCallManager.stop();
              navigation.goBack();
            }}
          />
          <Text style={styles.titleTxt}>Playback</Text>
          <View style={styles.viewPlayer}>
            <View style={styles.viewRecorder}>
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
              <View style={styles.playBtnWrapper}>
                <Button
                  onPress={isPlaying ? onPausePlay : onStartPlay}
                  title={isPlaying ? 'Pause' : 'Play'}></Button>
              </View>
              <View style={styles.recordBtnWrapper}>
                <Button onPress={onStartRecord} title="New Recording"></Button>
              </View>
            </View>
          </View>
        </View>
      );
    }
  } else {
    return <View></View>;
  }
};

const styles = StyleSheet.create({
  titleTxt: {
    marginTop: 100,
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
  },
  viewRecorder: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  recordBtnWrapper: {
    flexDirection: 'row',
  },
  viewPlayer: {
    marginTop: 60,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  viewBarWrapper: {
    marginHorizontal: 28,
    alignSelf: 'stretch',
  },
  viewBar: {
    backgroundColor: '#ccc',
    height: 20,
    alignSelf: 'stretch',
  },
  playStatusTxt: {
    marginTop: 8,
    color: '#ccc',
  },
  playBtnWrapper: {
    flexDirection: 'row',
    marginTop: 40,
  },
  btn: {
    borderColor: 'white',
    borderWidth: 1,
  },
  txt: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  txtRecordCounter: {
    marginTop: 32,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
    textAlign: 'center',
  },
  txtCounter: {
    marginTop: 12,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
});
