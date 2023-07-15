import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  DeviceEventEmitter,
  Platform,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import PhoneNumber from './components/PhoneNumber';
import VerifyCode from './components/VerifyCode';
import Authenticated from './components/Authenticated';
import RegisteredContacts from './components/RegisteredContacts';
import Room from './components/Room';
import RoomMembers from './components/RoomMembers';
import RoomName from './components/RoomName';
import Listen from './components/Listen';
import Record from './components/Record';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNetInfo} from '@react-native-community/netinfo';
import {RoomWsContextProvider} from './context/RoomWsContext';
import {RoomNameContextProvider} from './context/RoomNameContext';
import {ContactsContextProvider} from './context/ContactsContext';
import {ConnectedContextProvider} from './context/ConnectedContext';
import {UploadUrlContextProvider} from './context/UploadUrlContext';
import { MessagesContextProvider } from './context/MessagesContext';

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

  async function signIn(phoneNumber, countryCode) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      setAlpha2CountryCode(countryCode);
    } catch (error) {
      console.log(error.message);
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
      console.log(error.message);
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

  if (authenticated && userId && authToken) {
    let homeHeaderStyle = {
      backgroundColor: 'transparent',
    };
    if (Platform.OS === 'android') {
      homeHeaderStyle['backgroundColor'] = 'black';
    }
    let listenHeaderOptions = {
      headerTitle: '',
      headerShown: true,
      headerBackVisible: false,
      headerStyle: {
        backgroundColor: 'transparent',
      },
    };
    if (Platform.OS == 'android') {
      listenHeaderOptions['headerStyle']['backgroundColor'] = 'black';
    }

    return (
      <NavigationContainer theme={navTheme}>
        <RoomWsContextProvider>
          <ConnectedContextProvider>
            <ContactsContextProvider>
              <RoomNameContextProvider>
                <UploadUrlContextProvider>
                  <MessagesContextProvider>
                    <Stack.Navigator>
                      <Stack.Screen
                        initialParams={{
                          userId: userId,
                          authToken: authToken,
                          alpha2CountryCode: alpha2CountryCode,
                        }}
                        name="Home"
                        component={Authenticated}
                        options={{
                          headerTitle: '',
                          headerShown: true,
                          headerStyle: homeHeaderStyle,
                        }}
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
                      <Stack.Screen
                        name="Room"
                        component={Room}
                        options={{
                          headerTitle: 'Room',
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
                      <Stack.Screen
                        name="Members"
                        component={RoomMembers}
                        options={{
                          headerTitle: 'Members',
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
                      <Stack.Screen
                        name="RoomName"
                        component={RoomName}
                        options={{
                          headerShown: false,
                        }}
                      />
                      <Stack.Screen
                        name="Listen"
                        component={Listen}
                        options={listenHeaderOptions}
                      />
                      <Stack.Screen
                        name="Record"
                        component={Record}
                        options={listenHeaderOptions}
                      />
                    </Stack.Navigator>
                  </MessagesContextProvider>
                </UploadUrlContextProvider>
              </RoomNameContextProvider>
            </ContactsContextProvider>
          </ConnectedContextProvider>
        </RoomWsContextProvider>
      </NavigationContainer>
    );
  }

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
    backgroundColor: 'black',
  },
  text: {
    fontSize: 20,
    color: 'white',
  },
});

export default App;
