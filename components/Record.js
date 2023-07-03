import React, {useState, useCallback} from 'react';
import {
  View,
  DeviceEventEmitter,
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';

import Sound from 'react-native-sound';
import Button from './Button';
import RecordButton from './RecordButton';
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
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [playTime, setPlayTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [uri, setUri] = useState('');
  const [audioRecorderPlayer, setAudioRecorderPlayer] = useState(
    new AudioRecorderPlayer(),
  );
  audioRecorderPlayer.setSubscriptionDuration(0.1);
  const onStartPlay = async e => {
    setIsPlaying(true);

    try {
      if (e.currentPosition > 0) {
        await audioRecorderPlayer.resumePlayer();
      } else {
        const msg = await audioRecorderPlayer.startPlayer(
          Platform.select({
            ios: undefined,
            android: undefined,
          }),
        );

        const volume = await audioRecorderPlayer.setVolume(1.0);
        console.log(`path: ${msg}`, `volume: ${volume}`);

        audioRecorderPlayer.addPlayBackListener(e => {
          console.log('playBackListener', e);
          setCurrentPositionSec(e.currentPosition);
          setCurrentDurationSec(e.duration);
          setPlayTime(
            audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
          );
          setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
          if (Math.floor(e.currentPosition) == Math.floor(e.duration)) {
            setIsPlaying(false);
          }
        });
      }
    } catch (err) {
      console.log('startPlayer error', err);
    }
  };
  const onStopPlay = async () => {
    console.log('onStopPlay');
    setIsPlaying(false);
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
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
      console.log(e);
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setDuration(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
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
  onStatusPress = e => {
    const touchX = e.nativeEvent.locationX;
    console.log(`touchX: ${touchX}`);

    const playWidth =
      (currentPositionSec / currentDurationSec) *
      (Dimensions.get('screen').width - 56);
    console.log(`currentPlayWidth: ${playWidth}`);

    const currentPosition = Math.round(currentPositionSec);

    if (playWidth && playWidth < touchX) {
      const addSecs = Math.round(currentPosition + 1000);
      audioRecorderPlayer.seekToPlayer(addSecs);
      console.log(`addSecs: ${addSecs}`);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      audioRecorderPlayer.seekToPlayer(subSecs);
      console.log(`subSecs: ${subSecs}`);
    }
  };
  onStopRecord = async () => {
    setIsRecording(false);
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    console.log(result);
  };
  onPausePlay = async () => {
    setIsPlaying(false);
    await audioRecorderPlayer.pausePlayer();
  };
  let playWidth =
    (currentPositionSec / currentDurationSec) *
    (Dimensions.get('screen').width - 56);

  if (!playWidth) {
    playWidth = 0;
  }
  viewBarPlayStyle = function () {
    return {
      backgroundColor: 'white',
      height: 20,
      width: playWidth,
    };
  };
  if (!isNear) {
    if (isRecording) {
      return (
        <SafeAreaView style={styles.container}>
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
              <RecordButton
                style={[styles.btn, {marginLeft: 12}]}
                onPress={onStopRecord}
                textStyle={styles.txt}>
                Stop
              </RecordButton>
            </View>
          </View>
        </SafeAreaView>
      );
    } else {
      if (uri) {
        return (
          <SafeAreaView style={styles.container}>
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
              <TouchableOpacity
                style={styles.viewBarWrapper}
                onPress={onStatusPress}>
                <View style={styles.viewBar}>
                  <View style={viewBarPlayStyle()} />
                </View>
              </TouchableOpacity>
              <Text style={styles.txtCounter}>
                {playTime} / {duration}
              </Text>
              <View style={styles.playBtnWrapper}>
                <RecordButton
                  style={styles.btn}
                  onPress={isPlaying ? onPausePlay : onStartPlay}
                  textStyle={styles.txt}>
                  {isPlaying ? 'Pause' : 'Play'}
                </RecordButton>
              </View>
              <View style={styles.viewRecorder}>
                <View style={styles.recordBtnWrapper}>
                  <RecordButton
                    style={styles.btn}
                    onPress={onStartRecord}
                    textStyle={styles.txt}>
                    New Recording
                  </RecordButton>
                </View>
              </View>
            </View>
          </SafeAreaView>
        );
      } else {
        return (
          <SafeAreaView style={styles.container}>
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
            <Text style={styles.titleTxt}>Audio</Text>
            <View style={styles.viewRecorder}>
              <View style={styles.recordBtnWrapper}>
                <RecordButton
                  style={styles.btn}
                  onPress={onStartRecord}
                  textStyle={styles.txt}>
                  New Recording
                </RecordButton>
              </View>
            </View>
          </SafeAreaView>
        );
      }
    }
  } else {
    return <View></View>;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#455A64',
    flexDirection: 'column',
    alignItems: 'center',
  },
  titleTxt: {
    marginTop: 100,
    color: 'white',
    fontSize: 28,
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
