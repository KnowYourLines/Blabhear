import React, { useState } from 'react';
import {
  StyleSheet, Text, View, Button, TextInput, TouchableOpacity
} from 'react-native';
import { CountryPicker } from "react-native-country-codes-picker";

export default function PhoneNumber(props) {
  const [show, setShow] = useState(true);
  const [countryDialCode, setCountryDialCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  React.useEffect(() => {
    // the package is buggy and requires show state to be true before being set to false to work
    setShow(false)
  }, [])

  const inputsValid = () => {
    if (!countryDialCode.trim()) {
      alert("Please enter country's dial code");
      return false;
    }
    if (!phoneNumber.trim()) {
      alert('Please enter phone number');
      return false;
    }
    return true
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Enter Phone Number</Text>
      <CountryPicker
        style={{
          modal: {
            backgroundColor: 'lightblue'
          },
          countryButtonStyles: {
            backgroundColor: 'black'
          },
          textInput: {
            backgroundColor: 'black',

          },
          searchMessageText: {
            color: 'black'
          },
          itemsList: {
            height: '90%'
          }
        }}
        show={show}
        pickerButtonOnPress={(item) => {
          setCountryDialCode(item.dial_code)
          setShow(false);
        }}
        inputPlaceholder={'Search by country or dial code'}
      />
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => { setShow(true) }}
          style={styles.countryInput}
        >
          <Text style={{
            color: 'white',
            fontSize: 25
          }}>
            {countryDialCode}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          keyboardType="numeric"
          onChangeText={setPhoneNumber}
        />
      </View>
      <Button title="Sign In" onPress={() => { if (inputsValid()) props.onSubmit(countryDialCode + phoneNumber) }} />

    </View>
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
  },
  countryInput: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: '25%',
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 25,
  },
});