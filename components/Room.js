import React, {useState, useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {RoomWsContext} from '../context/RoomWsContext';
import {HeaderBackButton} from '@react-navigation/elements';

export default ({navigation, route}) => {
  const state = useContext(RoomWsContext);
  const [name, setName] = useState(route.params.name);
  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: name,
      headerLeft: props => (
        <HeaderBackButton
          {...props}
          onPress={() => {
            navigation.navigate('Home');
          }}
        />
      ),
    });
  }, [navigation, name]);
  return <View style={styles.listContainer}></View>;
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
});
