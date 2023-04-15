import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import auth from '@react-native-firebase/auth';

function connectWebSocket(props) {
  const backendUrl = new URL("http://localhost:8000")
  const ws_scheme = backendUrl.protocol == "https:" ? "wss" : "ws";
  const path = ws_scheme + '://' + backendUrl.hostname + ':' + backendUrl.port + '/ws/user/' + props.userId + '/?token=' + props.authToken
  const ws = new WebSocket(path);
  ws.onopen = () => {
    // connection opened
    console.log('opened'); // send a message
  };

  ws.onmessage = e => {
    // a message was received
    console.log(e.data);
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
}
export default function Authenticated(props) {
  React.useEffect(() => {
    connectWebSocket(props)
  }, [])
  return (
    <View style={styles.screen}>

      <Text style={styles.text}>You're Logged In</Text>
      <Text style={styles.phoneNumber}>{auth().currentUser.phoneNumber}</Text>
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
  input: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: 300,
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 25,
  },
  phoneNumber: {
    fontSize: 21,
    marginTop: 20,
  },
});