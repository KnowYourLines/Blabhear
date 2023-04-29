import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import PhoneNumber from './components/PhoneNumber';
import VerifyCode from './components/VerifyCode';
import Authenticated from './components/Authenticated';
import RegisteredContacts from './components/RegisteredContacts';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
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
      background: 'transparent',
    },
  };

  async function signIn(phoneNumber, alpha2CountryCode) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      setAlpha2CountryCode(alpha2CountryCode);
    } catch (error) {
      alert(error);
    }
  }

  async function confirmVerificationCode(code) {
    try {
      await confirm.confirm(code);
      setConfirm(null);
    } catch (error) {
      alert(error);
    }
  }

  auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdToken().then(token => {
        setAuthToken(token);
        setUserId(user.uid);
      });
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  });

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

  if (confirm) return <VerifyCode onSubmit={confirmVerificationCode} />;

  if (!authenticated) return <PhoneNumber onSubmit={signIn} />;
}

export default App;
