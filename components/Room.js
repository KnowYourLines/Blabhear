import React, {useState, useContext} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  NativeModules,
  Platform,
} from 'react-native';
import Button from './Button';
import {HeaderBackButton} from '@react-navigation/elements';
import {RoomNameContext} from '../context/RoomNameContext';
import {ConnectedContext} from '../context/ConnectedContext';

export default ({navigation, route}) => {
  const state = useContext(RoomNameContext);
  const [members, setMembers] = useState(route.params.members);
  const connectedState = useContext(ConnectedContext);

  if (Platform.OS == 'ios') {
    NativeModules.InCallManager.addListener('Proximity');
  }
  React.useEffect(() => {
    navigation.setOptions({
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
            navigation.navigate('Home');
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
  }, [navigation, state.roomName]);
  if (!connectedState.connected) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenText}>Can't connect to Blabhear</Text>
      </View>
    );
  }
  return (
    <View style={styles.listContainer}>
      <Button
        title="Listen"
        onPress={() => {
          navigation.navigate('Listen');
        }}
      />
    </View>
  );
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
