import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import PhoneNumber from './components/PhoneNumber';
import VerifyCode from './components/VerifyCode';
import Authenticated from './components/Authenticated';

function App(): JSX.Element {
  const [confirm, setConfirm] = useState(null);
  const [alpha2CountryCode, setAlpha2CountryCode] = useState("");
  const [userId, setUserId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  async function signIn(phoneNumber, alpha2CountryCode) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      setAlpha2CountryCode(alpha2CountryCode)
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

  auth().onAuthStateChanged((user) => {
    if (user) {
      user.getIdToken().then((token) => {
        setAuthToken(token)
        setUserId(user.uid)
      });
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  })

  if (authenticated && userId && authToken) return <Authenticated userId={userId} authToken={authToken} alpha2CountryCode={alpha2CountryCode} />;

  if (confirm) return <VerifyCode onSubmit={confirmVerificationCode} />;

  if (!authenticated) return <PhoneNumber onSubmit={signIn} />;
}


export default App;
