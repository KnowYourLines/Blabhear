import React, {useContext, useState} from 'react';
import {View, StyleSheet, Text, FlatList, TouchableOpacity} from 'react-native';
import moment from 'moment';
import {RoomWsContext} from '../context/RoomWsContext';

export default ({navigation, messages}) => {
  const state = useContext(RoomWsContext);
  const [currentMsg, setCurrentMsg] = useState(null);
  const [currentMsgTimestamp, setCurrentMsgTimestamp] = useState(null);
  const [refresh, setRefresh] = useState(true);
  setInterval(() => setRefresh(!refresh), 45000);

  const getNextMessage = timestamp => {
    const message = messages.find(message => message.timestamp > timestamp);
    return message;
  };

  const getPrevMessage = timestamp => {
    const message = messages.findLast(message => message.timestamp < timestamp);
    return message;
  };

  React.useEffect(() => {
    if (messages.length > 0) {
      const firstUnreadMsg = messages.find(message => !message.read);
      if (!currentMsgTimestamp && firstUnreadMsg) {
        console.log('set first message')
        setCurrentMsg(firstUnreadMsg);
        setCurrentMsgTimestamp(firstUnreadMsg.timestamp);
      } else if (!currentMsgTimestamp && !firstUnreadMsg) {
        console.log('set last message as first message')
        const lastMsg = messages.at(-1);
        setCurrentMsg(lastMsg);
        setCurrentMsgTimestamp(lastMsg.timestamp);
      }
    }
  }, [messages]);

  renderItem = ({item, index}) => {
    const timestamp = moment.unix(item.timestamp).fromNow();
    const onPress = () => {
      state.roomWs.send(
        JSON.stringify({
          command: 'read_message_notification',
          message_notification_id: messages[index]['id'],
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
