import { View, Button } from 'react-native';
import Contacts from 'react-native-contacts';

export default function NewContact(props) {
    if (props.canAccess) {
        return (<View style={{ marginTop: 30 }}>
            <Button title="New Contact" onPress={() => Contacts.openContactForm({}).then(() => {
            })} />
          </View>)
    }}