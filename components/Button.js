import React from 'react';
import {Text, StyleSheet, Pressable} from 'react-native';

export default function Button(props) {
  const {onPress, title = 'Save', disabled = false} = props;
  return (
    <Pressable style={styles.button} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '3%',
    paddingHorizontal: '3%',
    borderRadius: 4,
    backgroundColor: 'blue',
  },
  text: {
    fontSize: 20,
    color: 'white',
  },
});
