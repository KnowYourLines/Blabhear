import React, {useState} from 'react';
import {View, StyleSheet, Text, FlatList, Button} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

export default ({navigation, route}) => {
  const [contacts, setContacts] = useState(route.params.contacts);
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
      <View style={styles.screen}>
        <Text style={styles.text}>Select contacts</Text>
      </View>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.display_name || item.phone_number}
      />
      <View style={{marginTop: 30}}>
        <Button
          title="Chat"
          onPress={() => {
            const result = contacts.filter(
              contact => contact.selected === true,
            );
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
  screen: {
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
    textTransform: 'capitalize',
    fontSize: 20,
  },
  text: {
    fontSize: 25,
  },
});
