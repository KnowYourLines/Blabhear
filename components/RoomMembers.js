import React, {useState, useContext} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import {ConnectedContext} from '../context/ConnectedContext';

export default ({route}) => {
  const [members, setMembers] = useState(route.params.members);
  const connectedState = useContext(ConnectedContext);

  renderItem = ({item}) => <ItemRenderer label={item.display_name} />;
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
        data={members}
        renderItem={renderItem}
        keyExtractor={item => item.display_name}
      />
    </View>
  );
};

const ItemRenderer = ({label}) => (
  <View style={styles.item}>
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
