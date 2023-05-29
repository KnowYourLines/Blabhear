import React, {useState} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';

export default ({route}) => {
  const [members, setMembers] = useState(route.params.members);
  console.log(members);
  renderItem = ({item}) => <ItemRenderer label={item.display_name} />;
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
