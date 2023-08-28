import React, {useContext, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import {RoomWsContext} from '../context/RoomWsContext';
import {MessagePageContext} from '../context/MessagePageContext';

export default ({navigation, messages}) => {
  const state = useContext(RoomWsContext);
  const messagePageState = useContext(MessagePageContext);
  const [refresh, setRefresh] = useState(true);
  setInterval(() => setRefresh(!refresh), 45000);

  renderItem = ({item, index}) => {
    const timestamp = moment.unix(item.timestamp).fromNow();
    const onPress = () => {
      state.roomWs.send(
        JSON.stringify({
          command: 'read_message_notification',
          message_notification_id: messages[index]['id'],
          page_number: messagePageState.messagePage,
        }),
      );
      navigation.navigate('Listen', {
        soundUrl: messages[index].url,
        messageNotificationId: messages[index].id,
        isOwnMessage: messages[index].is_own_message,
      });
    };
    return (
      <View style={item.read ? styles.item : styles.unreadItem}>
        <TouchableOpacity style={styles.title} onPress={onPress}>
          <Text style={styles.title} numberOfLines={1}>
            {item.message__creator__display_name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {timestamp === 'in a few seconds' ? 'just now' : timestamp}
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
        extraData={refresh}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        snapToInterval={Dimensions.get('window').height - 80}
        decelerationRate={'fast'}
        snapToAlignment={'start'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  item: {
    flex: 1,
    height: Dimensions.get('window').height - 80,
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
    flex: 1,
    height: Dimensions.get('window').height - 80,
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    backgroundColor: 'blue',
  },
});
