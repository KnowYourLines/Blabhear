import React, {useState, useContext} from 'react';
import {View, StyleSheet, Text, FlatList, Alert} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Button from './Button';
import {AppContext} from '../AppContext';

export default ({navigation, route}) => {
  const state = useContext(AppContext);
  const [contacts, setContacts] = useState(state.registeredContacts);
  onUpdateValue = (index, value) => {
    contacts[index].selected = value;
    return setContacts([...contacts]);
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
  return (
    <View style={styles.listContainer}>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.display_name || item.phone_number}
      />
      <View style={{marginBottom: '5%'}}>
        <Button
          title="Chat"
          onPress={() => {
            const result = contacts.filter(
              contact => contact.selected === true,
            );
            if (result.length == 0) {
              Alert.alert('Please select a contact', '', [
                {
                  text: 'OK',
                  style: 'OK',
                },
              ]);
            }
            console.log(result);
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
