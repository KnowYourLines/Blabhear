import {View} from 'react-native';
import Button from './Button';
import Contacts from 'react-native-contacts';

export default function NewContact(props) {
  if (props.canAccess) {
    return (
      <View>
        <Button
          title="New Contact"
          onPress={() => Contacts.openContactForm({}).then(() => {})}
        />
      </View>
    );
  }
}
