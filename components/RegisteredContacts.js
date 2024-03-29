import React, {useContext} from 'react';
import {View, StyleSheet, Text, FlatList, Alert} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Button from './Button';
import {RoomWsContext} from '../context/RoomWsContext';
import {ContactsContext} from '../context/ContactsContext';
import {ConnectedContext} from '../context/ConnectedContext';

export default () => {
  const state = useContext(RoomWsContext);
  const contactsState = useContext(ContactsContext);
  const connectedState = useContext(ConnectedContext);
  onUpdateValue = (index, value) => {
    const contacts = contactsState.contacts;
    contacts[index].selected = value;
    return contactsState.setContacts([...contacts]);
  };
  renderItem = ({item, index}) => (
    <ItemRenderer
      key={index}
      index={index}
      selected={item.selected}
      label={item.display_name || item.phone_number}
      onUpdateValue={onUpdateValue}
    />
  );
  if (!connectedState.connected) {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>Can't connect to Blabhear</Text>
      </View>
    );
  }
  return (
    <View style={styles.listContainer}>
      <FlatList
        data={contactsState.contacts}
        renderItem={renderItem}
        keyExtractor={item => item.display_name || item.phone_number}
      />
      <View style={{marginBottom: '5%'}}>
        <Button
          title="Chat"
          onPress={() => {
            const result = contactsState.contacts
              .filter(contact => contact.selected === true)
              .map(contact => contact.phone_number);
            if (result.length == 0) {
              Alert.alert('Please select a contact', '', [
                {
                  text: 'OK',
                  style: 'OK',
                },
              ]);
            } else {
              state.roomWs.send(
                JSON.stringify({
                  command: 'connect',
                  phone_numbers: result,
                }),
              );
            }
          }}
        />
      </View>
    </View>
  );
};

const ItemRenderer = ({index, label, selected, onUpdateValue}) => (
  <View style={styles.item}>
    <CheckBox
      disabled={false}
      value={selected}
      onValueChange={value => onUpdateValue(index, value)}
    />
    <Text style={styles.title}>{label}</Text>
  </View>
);

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
  listContainer: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  title: {
    paddingLeft: '5%',
    fontSize: 20,
    color: 'white',
  },
});
