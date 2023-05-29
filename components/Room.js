import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Image} from 'react-native';
import {HeaderBackButton} from '@react-navigation/elements';

export default ({navigation, route}) => {
  const [name, setName] = useState(route.params.name);
  const [members, setMembers] = useState(route.params.members);
  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.row}>
          <Text style={styles.titleText}>{name}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              navigation.navigate('RoomName', {name: name});
            }}>
            <Image source={require('../assets/icons8-edit-24.png')} />
          </TouchableOpacity>
        </View>
      ),
      headerBackVisible: false,
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
  titleText: {
    fontSize: 20,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    backgroundColor: 'white',
    borderRadius: 5,
  },
});
