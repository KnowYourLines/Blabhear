import React, {useState} from 'react';
import {StyleSheet, Text, View, TextInput, Alert} from 'react-native';
import Button from './Button';

export default function VerifyCode({confirm}) {
  const [code, setCode] = useState('');

  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Enter Verification Code</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        style={styles.input}
      />
      <Button
        title="Confirm"
        onPress={async () => {
          try {
            await confirm.confirm(code);
          } catch (error) {
            console.log(error.message);
            Alert.alert('Uh-oh!', error.message, [
              {
                text: 'OK',
                style: 'OK',
              },
            ]);
          }
        }}
      />
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
    width: '75%',
    marginVertical: 30,
    fontSize: 25,
    padding: 10,
    borderRadius: 8,
    color: 'white',
  },
  text: {
    fontSize: 25,
    color: 'white',
  },
});
