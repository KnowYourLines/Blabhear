import React, {useContext} from 'react';
import {View, StyleSheet, Text, FlatList, TouchableOpacity} from 'react-native';
import {RoomWsContext} from '../context/RoomWsContext';

export default ({navigation, messages}) => {
  const state = useContext(RoomWsContext);

  renderItem = ({item, index}) => {
    const onPress = () => {
      console.log(messages[index]);
      state.roomWs.send(
        JSON.stringify({
          command: 'read_message_notification',
          message_notification_id: messages[index]['id'],
        }),
      );
      navigation.navigate('Listen', {soundUrl: messages[index].url});
    };
    return (
      <View style={item.read ? styles.item : styles.unreadItem}>
        <TouchableOpacity style={styles.title} onPress={onPress}>
          <Text style={styles.title} numberOfLines={1}>
            {item.message__creator__display_name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.readable_timestamp}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={styles.listContainer}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
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
