import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import moment from 'moment';

export default ({navigation, messages}) => {
  const [refresh, setRefresh] = useState(true);
  setInterval(() => setRefresh(!refresh), 45000);

  renderItem = ({item}) => {
    const timestamp = moment.unix(item.timestamp).fromNow();
    const onPress = () => {
      navigation.navigate('Listen', {
        soundUrl: item.url,
        messageNotificationId: item.id,
        isOwnMessage: item.is_own_message,
      });
    };
    return (
      <View style={item.is_own_message ? styles.myItem : styles.item}>
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
        snapToInterval={Dimensions.get('window').height - 120}
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
    height: Dimensions.get('window').height - 120,
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  myItem: {
    flex: 1,
    height: Dimensions.get('window').height - 120,
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    backgroundColor: 'midnightblue',
  },
  title: {
    fontSize: 20,
    color: 'white',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'grey',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});
