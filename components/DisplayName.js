import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import Button from './Button';

export default function DisplayName(props) {
  if (!props.isEditing) {
    return (
      <View style={styles.row}>
        <Text style={styles.text}>{props.displayName}</Text>
        <TouchableOpacity style={styles.editButton} onPress={props.onEdit}>
          <Image source={require('../assets/icons8-edit-24.png')} />
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View>
        <View style={styles.row}>
          <TextInput
            value={props.editableDisplayName}
            onChangeText={props.onChangeText}
            keyboardType="default"
            style={styles.edit}
          />
          <View style={styles.editButtons}>
            <Button title="Save" onPress={props.onSave} />
            <Button title="Cancel" onPress={props.onCancel} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
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
  edit: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: '60%',
    fontSize: 20,
    padding: 10,
    borderRadius: 8,
  },
  editButtons: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
