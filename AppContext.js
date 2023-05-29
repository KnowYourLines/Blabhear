import React, {useState} from 'react';

export const AppContext = React.createContext({
  roomWs: null,
  setRoomWs: () => {},
  registeredContacts: [],
  setRegisteredContacts: () => {},
});

export const AppContextProvider = props => {
  const setRoomWs = roomWs => {
    setState({...state, roomWs: roomWs});
  };

  const setRegisteredContacts = registeredContacts => {
    setState({...state, registeredContacts: registeredContacts});
  };

  const initState = {
    roomWs: null,
    setRoomWs: setRoomWs,
    registeredContacts: [],
    setRegisteredContacts: setRegisteredContacts,
  };

  const [state, setState] = useState(initState);

  return (
    <AppContext.Provider value={state}>{props.children}</AppContext.Provider>
  );
};
