import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Button from './Button';
import VerifyCode from './VerifyCode';
import {CountryPicker} from 'react-native-country-codes-picker';
import auth from '@react-native-firebase/auth';

export default function PhoneNumber() {
  const [confirm, setConfirm] = useState(null);
  const [show, setShow] = useState(true);
  const [signInDisabled, setSignInDisabled] = useState(false);
  const [countryDialCode, setCountryDialCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  React.useEffect(() => {
    // the package is buggy and requires show state to be true before being set to false to work
    setShow(false);
  }, []);

  const inputsValid = () => {
    if (!countryDialCode.trim()) {
      Alert.alert("Please enter country's dial code", '', [
        {
          text: 'OK',
          style: 'OK',
        },
      ]);
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Please enter phone number', '', [
        {
          text: 'OK',
          style: 'OK',
        },
      ]);
      return false;
    }
    return true;
  };

  return !confirm ? (
    <View style={styles.screen}>
      <Text style={styles.text}>Enter Phone Number</Text>
      <CountryPicker
        style={{
          modal: {
            backgroundColor: 'lightblue',
          },
          countryButtonStyles: {
            backgroundColor: 'grey',
          },
          textInput: {
            backgroundColor: 'grey',
            color: 'white',
          },
          searchMessageText: {
            color: 'black',
          },
          itemsList: {
            height: '80%',
          },
          dialCode: {
            color: 'white',
          },
          countryName: {
            color: 'white',
          },
        }}
        show={show}
        pickerButtonOnPress={item => {
          setCountryDialCode(item.dial_code);
          setShow(false);
        }}
        inputPlaceholder={'Search by country or dial code'}
        onBackdropPress={() => setShow(false)}
      />
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => {
            setShow(true);
          }}
          style={styles.countryInput}>
          <Text
            style={{
              color: 'white',
              fontSize: 25,
            }}>
            {countryDialCode}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={setPhoneNumber}
        />
      </View>

      <Button
        title="Sign In"
        disabled={signInDisabled}
        onPress={async () => {
          if (inputsValid()) {
            setSignInDisabled(true);
            try {
              const confirmation = await auth().signInWithPhoneNumber(
                countryDialCode + phoneNumber,
              );
              setConfirm(confirmation);
            } catch (error) {
              setSignInDisabled(false);
              console.log(error.message);
              Alert.alert('Uh-oh!', error.message, [
                {
                  text: 'OK',
                  style: 'OK',
                },
              ]);
            }
          }
        }}
      />
    </View>
  ) : (
    <VerifyCode confirm={confirm} />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: '60%',
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
    color: 'white',
    height: '50%',
  },
  countryInput: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: '25%',
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
    height: '50%',
  },
  text: {
    fontSize: 25,
    color: 'white',
  },
});
