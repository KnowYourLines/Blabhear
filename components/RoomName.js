import React, {useState, useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import DisplayName from './DisplayName';
import {RoomWsContext} from '../context/RoomWsContext';

export default function RoomName({navigation, route}) {
  const state = useContext(RoomWsContext);
  const [displayName, setDisplayName] = useState(route.params.name);
  const [editableDisplayName, setEditableDisplayName] = useState(
    route.params.name,
  );
  const [editName, setEditName] = useState(true);
  return (
    <View style={styles.screen}>
      <DisplayName
        isEditing={editName}
        displayName={displayName}
        editableDisplayName={editableDisplayName}
        onChangeText={setEditableDisplayName}
        onCancel={() => {
          navigation.goBack();
        }}
        onSave={() => {
          state.roomWs.send(
            JSON.stringify({
              command: 'update_room_name',
              name: editableDisplayName,
            }),
          );
        }}></DisplayName>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
