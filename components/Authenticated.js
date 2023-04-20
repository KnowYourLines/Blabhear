import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Image, TextInput } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Authenticated(props) {
  const [displayName, setDisplayName] = useState("");
  const [editName, setEditName] = useState(false);
  const [ws, setWs] = useState(null);

  function connectWebSocket(props) {
    const backendUrl = new URL("http://localhost:8000")
    const ws_scheme = backendUrl.protocol == "https:" ? "wss" : "ws";
    const path = ws_scheme + '://' + backendUrl.hostname + ':' + backendUrl.port + '/ws/user/' + props.userId + '/?token=' + props.authToken + '&country=' + props.alpha2CountryCode
    const ws = new WebSocket(path);
    ws.onopen = () => {
      // connection opened
      console.log('opened');
    };

    ws.onmessage = message => {
      console.log(message.data);
      const data = JSON.parse(message.data);
      if ("display_name" in data) {
        setDisplayName(data.display_name)
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

  React.useEffect(() => {
    connectWebSocket(props)
  }, [])

  function DisplayName({ isEditing }) {
    const [editableDisplayName, setEditableDisplayName] = useState(displayName);
    if (!isEditing) {
      return (<View style={styles.row}>
        <Text style={styles.text}>{displayName}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => { setEditName(true) }}
        >
          <Image
            source={require('../assets/icons8-edit-24.png')}
          /></TouchableOpacity>
      </View>)
    }
    else {
      return (
        <View>
          <View style={styles.row}>
            <TextInput
              value={editableDisplayName}
              onChangeText={setEditableDisplayName}
              keyboardType="default"
              style={styles.edit}
            /><View style={styles.editButtons}><Button title="Save" onPress={() => {
              ws.send(
                JSON.stringify({
                  command: "update_display_name",
                })
              ); setEditName(false)
            }} /><Button title="Cancel" onPress={() => setEditName(false)} /></View>
          </View></View>
      )
    }
  }
  return (
    <View style={styles.screen}>
      <DisplayName isEditing={editName}></DisplayName>
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
  editButton: {
    backgroundColor: 'white',
    borderRadius: 5,
  },
  edit: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: '60%',
    fontSize: 20,
    padding: 10,
    borderRadius: 8,
  },
  editButtons: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
});