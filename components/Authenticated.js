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
import DisplayName from './DisplayName';
import NewContact from './NewContact';
import Notifications from './Notifications';
import Button from './Button';
import Contacts from 'react-native-contacts';
import Config from 'react-native-config';
import {RoomWsContext} from '../context/RoomWsContext';
import {RoomNameContext} from '../context/RoomNameContext';
import {ContactsContext} from '../context/ContactsContext';
import {ConnectedContext} from '../context/ConnectedContext';
import {UploadUrlContext} from '../context/UploadUrlContext';
import {UploadFilenameContext} from '../context/UploadFilenameContext';
import {MessagesContext} from '../context/MessagesContext';

export default function Authenticated({navigation, route}) {
  const [displayName, setDisplayName] = useState('');
  const [editableDisplayName, setEditableDisplayName] = useState('');
  const [editName, setEditName] = useState(false);
  const [userWs, setUserWs] = useState(null);
  const [canAccessContacts, setCanAccessContacts] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const state = useContext(RoomWsContext);
  const roomNameState = useContext(RoomNameContext);
  const contactsState = useContext(ContactsContext);
  const connectedState = useContext(ConnectedContext);
  const uploadUrlState = useContext(UploadUrlContext);
  const uploadFilenameState = useContext(UploadFilenameContext);
  const messagesState = useContext(MessagesContext);

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
      props.authToken;
    const ws = new WebSocket(path);
    ws.onopen = () => {
      connectedState.setConnected(true);
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
      const data = JSON.parse(message.data);
      if ('display_name' in data) {
        setDisplayName(data.display_name);
        setEditableDisplayName(data.display_name);
      } else if ('registered_contacts' in data) {
        contactsState.setContacts(data.registered_contacts);
      } else if ('notifications' in data) {
        setNotifications(data.notifications);
      }
    };

    ws.onerror = e => {
      // an error occurred
      console.log(e.message);
      connectedState.setConnected(false);
    };

    ws.onclose = e => {
      // connection closed
      console.log(e.code, e.reason);
      connectedState.setConnected(false);
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
    let msgTimeout = null;
    let uploadTimeout = null;
    let messages = [];
    ws.onmessage = message => {
      const data = JSON.parse(message.data);
      if ('new_room' == data.type) {
        roomNameState.setRoomName(data.room_name);
        navigation.navigate('Room', {
          members: data.room_members,
        });
      } else if ('updated_room_name' == data.type) {
        roomNameState.setRoomName(data.room_name);
      } else if ('upload_url' in data) {
        uploadUrlState.setUploadUrl(data.upload_url);
        uploadFilenameState.setUploadFilename(data.upload_filename);
        if (uploadTimeout) {
          clearTimeout(uploadTimeout);
        }
        const newUploadTimeout = setTimeout(() => {
          ws.send(
            JSON.stringify({
              command: 'fetch_upload_url',
            }),
          );
        }, data.refresh_upload_destination_in);
        uploadTimeout = newUploadTimeout;
      } else if ('message_notifications' in data) {
        messages = data.message_notifications;
        messagesState.setMessages(messages);
        if (msgTimeout) {
          clearTimeout(msgTimeout);
        }
        const newMsgTimeout = setTimeout(() => {
          ws.send(
            JSON.stringify({
              command: 'fetch_message_notifications',
            }),
          );
        }, data.refresh_message_notifications_in);
        msgTimeout = newMsgTimeout;
      } else if ('new_message' == data.type) {
        messages.push(data.message);
        messagesState.setMessages(messages);
      } else if ('deleted_message_notification' == data.type) {
        messages = messages.filter(
          message => message.id != data.message_notification_id,
        );
        messagesState.setMessages(messages);
      }
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

  if (!connectedState.connected) {
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

      <View style={styles.rowButtons}>
        <View>
          <Button
            title="Settings"
            onPress={() => navigation.navigate('Settings', {token: route.params.authToken})}
          />
        </View>
        <View>
          <Button
            title="New chat"
            onPress={() => {
              loadContacts(userWs);
              navigation.navigate('Contacts');
            }}
          />
        </View>
        <NewContact canAccess={canAccessContacts}></NewContact>
      </View>
      <Notifications notifications={notifications} />
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
  rowButtons: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
