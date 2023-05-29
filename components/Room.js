import React, {useState, useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {RoomWsContext} from '../context/RoomWsContext';

export default ({navigation, route}) => {
  const state = useContext(RoomWsContext);
  const [name, setName] = useState(route.params.name);
  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: name,
    });
  }, [navigation, name]);
  return <View style={styles.listContainer}></View>;
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
});
