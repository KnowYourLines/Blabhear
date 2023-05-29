import React, {useState, useContext} from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Platform,
  Linking,
  Alert,
  Text,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import DisplayName from './DisplayName';
import NewContact from './NewContact';
import Button from './Button';
import Contacts from 'react-native-contacts';
import Config from 'react-native-config';
import {AppContext} from '../AppContext';

export default function Authenticated({navigation, route}) {
  const [displayName, setDisplayName] = useState('');
  const [editableDisplayName, setEditableDisplayName] = useState('');
  const [editName, setEditName] = useState(false);
  const [userWs, setUserWs] = useState(null);
  const [canAccessContacts, setCanAccessContacts] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const state = useContext(AppContext);

  function connectUserWebSocket(props) {
    const backendUrl = new URL(Config.BACKEND_URL);
    const ws_scheme = backendUrl.protocol == 'https:' ? 'wss' : 'ws';
    const path =
      ws_scheme +
      '://' +
      backendUrl.hostname +
      ':' +
      backendUrl.port +
      '/ws/user/' +
      props.userId +
      '/?token=' +
      props.authToken +
      '&country=' +
      props.alpha2CountryCode;
    const ws = new WebSocket(path);
    ws.onopen = () => {
      setIsConnected(true);
      if (Platform.OS === 'android') {
        PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        ).then(granted => {
          setCanAccessContacts(granted);
          if (!granted) {
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            ).then(() => {
              PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
              ).then(granted => {
                setCanAccessContacts(granted);
                if (granted) {
                  loadContacts(ws);
                } else {
                  Alert.alert('No permission to access contacts', '', [
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
              });
            });
          } else {
            loadContacts(ws);
          }
        });
      } else if (Platform.OS == 'ios') {
        Contacts.checkPermission().then(permission => {
          const granted = permission === Contacts.PERMISSION_AUTHORIZED;
          if (!granted) {
            Contacts.requestPermission().then(permission => {
              const granted = permission === Contacts.PERMISSION_AUTHORIZED;
              if (granted) {
                setCanAccessContacts(granted);
                loadContacts(ws);
              } else {
                Alert.alert('No permission to access contacts', '', [
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
            });
          } else {
            setCanAccessContacts(granted);
            loadContacts(ws);
          }
        });
      } else {
        loadContacts(ws);
      }
    };

    ws.onmessage = message => {
      console.log(message.data);
      const data = JSON.parse(message.data);
      if ('display_name' in data) {
        setDisplayName(data.display_name);
        setEditableDisplayName(data.display_name);
      } else if ('registered_contacts' in data) {
        state.setRegisteredContacts(data.registered_contacts)
      }
    };

    ws.onerror = e => {
      // an error occurred
      console.log(e.message);
      setIsConnected(false);
    };

    ws.onclose = e => {
      // connection closed
      console.log(e.code, e.reason);
      setIsConnected(false);
      connectUserWebSocket(route.params);
    };
    setUserWs(ws);
  }

  function connectRoomWebSocket(props) {
    const backendUrl = new URL(Config.BACKEND_URL);
    const ws_scheme = backendUrl.protocol == 'https:' ? 'wss' : 'ws';
    const path =
      ws_scheme +
      '://' +
      backendUrl.hostname +
      ':' +
      backendUrl.port +
      '/ws/room/?token=' +
      props.authToken;
    const ws = new WebSocket(path);
    ws.onopen = () => {
      console.log('opened room websocket');
    };

    ws.onmessage = message => {
      const data = JSON.parse(message.data);
      console.log(data);
    };

    ws.onerror = e => {
      // an error occurred
      console.log(e.message);
    };

    ws.onclose = e => {
      // connection closed
      console.log(e.code, e.reason);
      connectRoomWebSocket(route.params);
    };
    state.setRoomWs(ws);
  }

  function loadContacts(ws) {
    Contacts.getAll().then(contacts => {
      ws.send(
        JSON.stringify({
          command: 'fetch_registered_contacts',
          phone_contacts: contacts,
        }),
      );
    });
  }
  React.useEffect(() => {
    connectUserWebSocket(route.params);
    connectRoomWebSocket(route.params);
  }, []);

  if (!isConnected) {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>Can't connect to Blabhear</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DisplayName
        isEditing={editName}
        displayName={displayName}
        editableDisplayName={editableDisplayName}
        onChangeText={setEditableDisplayName}
        onCancel={() => {
          setEditName(false);
          setEditableDisplayName(displayName);
        }}
        onSave={() => {
          userWs.send(
            JSON.stringify({
              command: 'update_display_name',
              name: editableDisplayName,
            }),
          );
          setEditName(false);
          setDisplayName(editableDisplayName);
        }}
        onEdit={() => {
          setEditName(true);
        }}></DisplayName>
      <NewContact canAccess={canAccessContacts}></NewContact>
      <View style={{marginTop: 30}}>
        <Button
          title="New chat"
          onPress={() => {
            loadContacts(userWs);
            navigation.navigate('Contacts');
          }}
        />
      </View>
      <View style={{marginTop: 30}}>
        <Button title="Sign Out" onPress={() => auth().signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
