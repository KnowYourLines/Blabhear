import React, {useState, useContext} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  DeviceEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import InCallManager from 'react-native-incall-manager';
import Button from './Button';
import Messages from './Messages';
import {HeaderBackButton} from '@react-navigation/elements';
import {RoomNameContext} from '../context/RoomNameContext';
import {ConnectedContext} from '../context/ConnectedContext';
import {MessagesContext} from '../context/MessagesContext';
import {RoomWsContext} from '../context/RoomWsContext';

export default ({navigation, route}) => {
  const state = useContext(RoomNameContext);
  const [isNear, setIsNear] = useState(false);
  const [members, setMembers] = useState(route.params.members);
  const connectedState = useContext(ConnectedContext);
  const messagesState = useContext(MessagesContext);
  const roomWsState = useContext(RoomWsContext);
  if (Platform.OS == 'ios') {
    NativeModules.InCallManager.addListener('Proximity');
  }
  DeviceEventEmitter.addListener('Proximity', function (data) {
    setIsNear(data['isNear']);
  });
  React.useEffect(() => {
    InCallManager.start();
    navigation.setOptions({
      headerShown: !isNear,
      headerTitle: () => {
        if (members.length == 2) {
          return (
            <View style={styles.row}>
              <Text style={styles.titleText}>{state.roomName}</Text>
            </View>
          );
        }
        return (
          <View style={styles.row}>
            <Text style={styles.titleText}>{state.roomName}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                navigation.navigate('RoomName', {
                  name: state.roomName,
                  members: members,
                });
              }}>
              <Image source={require('../assets/icons8-edit-24.png')} />
            </TouchableOpacity>
          </View>
        );
      },
      headerBackVisible: false,
      headerLeft: props => (
        <HeaderBackButton
          {...props}
          onPress={() => {
            InCallManager.stop();
            navigation.navigate('Home');
            roomWsState.roomWs.send(
              JSON.stringify({
                command: 'disconnect',
              }),
            );
          }}
        />
      ),
      headerRight: () => {
        if (members.length == 2) {
          return;
        }
        return (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Members', {members: members});
            }}>
            <Text style={styles.text}>Members</Text>
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, state.roomName, isNear]);
  if (!connectedState.connected) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenText}>Can't connect to Blabhear</Text>
      </View>
    );
  }
  if (!isNear) {
    return (
      <View style={styles.listContainer}>
        <Messages messages={messagesState.messages} navigation={navigation} />
        <View style={{marginBottom: '5%'}}>
          <Button
            title="Record"
            onPress={() => {
              navigation.navigate('Record');
            }}
          />
        </View>
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
  listContainer: {
    flex: 1,
  },
  text: {
    color: 'white',
  },
  titleText: {
    fontSize: 20,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    backgroundColor: 'white',
    borderRadius: 5,
  },
});
