import React, {useState, useContext} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {RoomWsContext} from '../context/RoomWsContext';
import {HeaderBackButton} from '@react-navigation/elements';

export default ({navigation, route}) => {
  const state = useContext(RoomWsContext);
  const [name, setName] = useState(route.params.name);
  const [members, setMembers] = useState(route.params.members);
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
      headerRight: () => {
        if (members.length == 2) {
          return;
        }
        return (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Members', {members: members});
            }}>
            <Text style={styles.text}>Members</Text>
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, name]);
  return <View style={styles.listContainer}></View>;
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  text: {
    color: 'white',
  },
});
