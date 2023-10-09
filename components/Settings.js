import React, {useContext} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import auth from '@react-native-firebase/auth';
import Config from 'react-native-config';
import Button from './Button';
import {ConnectedContext} from '../context/ConnectedContext';

export default ({navigation, route}) => {
  const connectedState = useContext(ConnectedContext);
  if (!connectedState.connected) {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>Can't connect to Blabhear</Text>
      </View>
    );
  }
  return (
    <View style={styles.listContainer}>
      <View style={{marginTop: '100%'}}>
        <Button
          title="Delete Account"
          onPress={() => {
            auth().signOut();
            const backendUrl = new URL(Config.BACKEND_URL);
            const request = new XMLHttpRequest();
            console.log(backendUrl)
            request.open('DELETE', `${backendUrl}account`);
            request.onload = () => {
              if (request.status !== 204) {
                console.warn(`${request.status}: ${request.response}`);
              }
            };
            request.onerror = () => {
              console.warn(`${request.status} error: ${request.response}`);
            };
            request.setRequestHeader(
              'Authorization',
              `Bearer ${route.params.token}`,
            );
            request.send();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'white',
  },
});
