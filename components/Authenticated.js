import React, { useState } from 'react';
import {
  StyleSheet, View, Button, PermissionsAndroid,
  Platform, Linking, Alert
} from 'react-native';
import auth from '@react-native-firebase/auth';
import DisplayName from './DisplayName';
import NewContact from './NewContact';
import Contacts from 'react-native-contacts';

export default function Authenticated(props) {
  const [displayName, setDisplayName] = useState("");
  const [editableDisplayName, setEditableDisplayName] = useState("");
  const [editName, setEditName] = useState(false);
  const [ws, setWs] = useState(null);
  const [canAccessContacts, setCanAccessContacts] = useState(false);

  function connectWebSocket(props) {
    const backendUrl = new URL("http://localhost:8000")
    const ws_scheme = backendUrl.protocol == "https:" ? "wss" : "ws";
    const path = ws_scheme + '://' + backendUrl.hostname + ':' + backendUrl.port + '/ws/user/' + props.userId + '/?token=' + props.authToken + '&country=' + props.alpha2CountryCode
    const ws = new WebSocket(path);
    ws.onopen = () => {
      if (Platform.OS === 'android') {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then((granted) => {
          setCanAccessContacts(granted)
          if (!granted) {
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then(() => {
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then((granted) => {
                  setCanAccessContacts(granted)
                  if (granted) {
                    loadContacts(ws)
                  } else {
                    Alert.alert('No permission to access contacts', '', [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      { text: 'Go to Settings', onPress: () => Linking.openSettings() },
                    ]);
                  }
                }
                );
              })
          } else {
            loadContacts(ws);
          }
        })
      } else {
        loadContacts(ws);
      }
    };

    ws.onmessage = message => {
      console.log(message.data);
      const data = JSON.parse(message.data);
      if ("display_name" in data) {
        setDisplayName(data.display_name)
        setEditableDisplayName(data.display_name)
      }
    };

    ws.onerror = e => {
      // an error occurred
      console.log(e.message);
    };

    ws.onclose = e => {
      // connection closed
      console.log(e.code, e.reason);
      connectWebSocket(props)
    };
    setWs(ws)
  }

  function loadContacts(ws) {
    Contacts.getAll()
      .then(contacts => {
        ws.send(
          JSON.stringify({
            command: "fetch_registered_contacts",
            phone_contacts: contacts
          })
        )
      })
  };
  React.useEffect(() => {
    connectWebSocket(props)
  }, [])

  return (
    <View style={styles.screen}>
      <DisplayName isEditing={editName} displayName={displayName} editableDisplayName={editableDisplayName} onChangeText={setEditableDisplayName} onCancel={() => { setEditName(false); setEditableDisplayName(displayName) }} onSave={() => {
        ws.send(
          JSON.stringify({
            command: "update_display_name",
            name: editableDisplayName
          })
        ); setEditName(false); setDisplayName(editableDisplayName)
      }} onEdit={() => { setEditName(true) }}></DisplayName>
      <NewContact canAccess={canAccessContacts}></NewContact>
      <View style={{ marginTop: 30 }}>
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
});