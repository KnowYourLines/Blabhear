import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import DisplayName from './DisplayName';

export default function Authenticated(props) {
  const [displayName, setDisplayName] = useState("");
  const [editableDisplayName, setEditableDisplayName] = useState("");
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