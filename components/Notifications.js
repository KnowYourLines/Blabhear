import React, {useContext} from 'react';
import {View, StyleSheet, Text, FlatList, TouchableOpacity} from 'react-native';
import {RoomWsContext} from '../context/RoomWsContext';

export default ({notifications}) => {
  const state = useContext(RoomWsContext);

  renderItem = ({item, index}) => {
    const onPress = () => {
      console.log(notifications[index]);
      state.roomWs.send(
        JSON.stringify({
          command: 'connect',
          phone_numbers: notifications[index]['member_phone_numbers'],
        }),
      );
    };
    return (
      <View style={item.read ? styles.item : styles.unreadItem}>
        <TouchableOpacity style={styles.title} onPress={onPress}>
          <Text style={styles.title} numberOfLines={1}>
            {item.room__display_name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.message__creator__display_name
              ? item.message__creator__display_name + ' spoke'
              : ''}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.timestamp}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.listContainer}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.room}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    marginTop: '5%',
  },
  item: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  title: {
    fontSize: 20,
    color: 'white',
    width: '100%',
  },
  subtitle: {
    fontSize: 15,
    color: 'grey',
    width: '100%',
  },
  unreadItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    backgroundColor: 'blue',
  },
});
