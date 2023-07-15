import React, {useState, useCallback, useContext} from 'react';
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
import {UploadUrlContext} from '../context/UploadUrlContext';
import {RoomWsContext} from '../context/RoomWsContext';

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
  const uploadUrlState = useContext(UploadUrlContext);
  const roomWsState = useContext(RoomWsContext);
  audioRecorderPlayer.setSubscriptionDuration(0.1);
  const onStartPlay = async e => {
    if (Platform.OS == 'android') {
      Sound.setCategory('Voice');
    } else {
      Sound.setCategory('Playback');
    }
    if (track) {
      setIsPlaying(true);
      track.play(completed => {
        if (completed) {
          setIsPlaying(false);
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    }
  };
  const onStopPlay = async () => {
    if (track) {
      setIsPlaying(false);
      track.pause();
      track.release();
      if (timeout) {
        clearInterval(timeout);
      }
    }
  };

  const onStartRecord = useCallback(async () => {
    if (Platform.OS == 'android') {
      Sound.setCategory('Voice');
    } else {
      Sound.setCategory('Playback');
    }
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

    const uri = await audioRecorderPlayer
      .startRecorder(
        Platform.select({
          ios: `recording.m4a`,
          android: `${RNFS.CachesDirectoryPath}/recording.m4a`,
        }),
        audioSet,
      )
      .catch(error => {
        console.warn(error);
      });

    audioRecorderPlayer.addRecordBackListener(e => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
    });
    console.log(`uri: ${uri}`);
    setUri(uri);
  }, []);
  React.useEffect(() => {
    InCallManager.start();
    if (Platform.OS == 'android') {
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
    const result = await audioRecorderPlayer.stopRecorder().catch(error => {
      console.warn(error);
    });
    audioRecorderPlayer.removeRecordBackListener();
    if (result) {
      const recording = new Sound(result, null, e => {
        if (e) {
          console.log('error loading track:', e);
        } else {
          recording.setVolume(1);
          setTrack(recording);
          setDuration(recording.getDuration());
          setPlaySeconds(0);
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
    }
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
  const deleteFile = destinationUri => {
    if (destinationUri) {
      RNFS.exists(destinationUri)
        .then(result => {
          console.log('file found');
          console.log(result);
          if (result) {
            return RNFS.unlink(destinationUri)
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
              deleteFile(uri);
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
              deleteFile(uri);
              await onStopPlay();
              InCallManager.stop();
              navigation.goBack();
            }}
          />
          <Text style={styles.titleTxt}>Playback</Text>
          <View style={styles.viewPlayer}>
            <View
              style={{
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
            <View style={styles.sendBtnWrapper}>
              <Button
                onPress={() => {
                  if (isPlaying) {
                    onStopPlay();
                  }
                  const request = new XMLHttpRequest();
                  request.open('PUT', uploadUrlState.uploadUrl);
                  request.onload = () => {
                    if (request.status !== 200) {
                      console.warn(`${request.status}: ${request.response}`);
                    }
                    deleteFile(uri);
                    roomWsState.roomWs.send(
                      JSON.stringify({
                        command: 'send_message',
                      }),
                    );
                    InCallManager.stop();
                    navigation.goBack();
                  };
                  request.onerror = () => {
                    console.warn(
                      `${request.status} error: ${request.response}`,
                    );
                  };
                  request.setRequestHeader('Content-Type', 'audio/mp4');
                  request.send({
                    uri: uri,
                    type: 'audio/mp4',
                  });
                }}
                title="Send"></Button>
            </View>
            <View style={styles.recordBtnWrapper}>
              <Button
                onPress={() => {
                  if (isPlaying) {
                    onStopPlay();
                  }
                  onStartRecord();
                }}
                title="New Recording"></Button>
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
    marginTop: 60,
    flexDirection: 'row',
  },
  viewPlayer: {
    marginTop: 40,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  playBtnWrapper: {
    flexDirection: 'row',
    marginTop: 40,
  },
  sendBtnWrapper: {
    flexDirection: 'row',
    marginTop: 60,
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
});
