import React, {useState} from 'react';

export const ContactsContext = React.createContext({
  contacts: [],
  setContacts: () => {},
});

export const ContactsContextProvider = props => {
  const setContacts = contacts => {
    setState({...state, contacts: contacts});
  };

  const initState = {
    contacts: [],
    setContacts: setContacts,
  };

  const [state, setState] = useState(initState);

  return (
    <ContactsContext.Provider value={state}>
      {props.children}
    </ContactsContext.Provider>
  );
};
