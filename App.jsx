import React, {useState} from 'react';
import {View, Text, StyleSheet, DeviceEventEmitter} from 'react-native';

import auth from '@react-native-firebase/auth';
import PhoneNumber from './components/PhoneNumber';
import VerifyCode from './components/VerifyCode';
import Authenticated from './components/Authenticated';
import RegisteredContacts from './components/RegisteredContacts';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNetInfo} from '@react-native-community/netinfo';
const Stack = createNativeStackNavigator();

function App() {
  const [confirm, setConfirm] = useState(null);
  const [alpha2CountryCode, setAlpha2CountryCode] = useState('');
  const [userId, setUserId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'black',
    },
  };

  const netInfo = useNetInfo();

  async function signIn(phoneNumber, alpha2CountryCode) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      setAlpha2CountryCode(alpha2CountryCode);
    } catch (error) {
      alert(error);
    }
  }

  DeviceEventEmitter.addListener('phoneSignIn', eventData =>
    signIn(eventData.intlPhoneNum, eventData.alpha2CountryCode),
  );

  async function confirmVerificationCode(code) {
    try {
      await confirm.confirm(code);
      setConfirm(null);
    } catch (error) {
      if (error.message != "Cannot read property 'confirm' of null")
        [alert(error)];
    }
  }

  DeviceEventEmitter.addListener('confirmOTP', eventData =>
    confirmVerificationCode(eventData.OTP),
  );

  auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdToken().then(token => {
        setAuthToken(token);
        setUserId(user.uid);
      });
      setAuthenticated(true);
    } else {
      setAuthToken('');
      setUserId('');
      setAuthenticated(false);
    }
  });

  if (!netInfo.isConnected && netInfo.isConnected !== null) {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>No internet connection</Text>
      </View>
    );
  }

  if (authenticated && userId && authToken)
    return (
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator>
          <Stack.Screen
            initialParams={{
              userId: userId,
              authToken: authToken,
              alpha2CountryCode: alpha2CountryCode,
            }}
            name="Home"
            component={Authenticated}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Contacts"
            component={RegisteredContacts}
            options={{
              headerTitle: 'Select Contacts',
              headerShown: true,
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerTintColor: 'white',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );

  if (confirm)
    return (
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="OTP"
            component={VerifyCode}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );

  if (!authenticated)
    return (
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="Phone"
            component={PhoneNumber}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
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
});

export default App;
