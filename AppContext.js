import React, {useState} from 'react';

export const AppContext = React.createContext({
  roomWs: null,
  setRoomWs: () => {},
});

export const AppContextProvider = props => {
  const setRoomWs = roomWs => {
    setState({...state, roomWs: roomWs});
  };

  const initState = {
    roomWs: null,
    setRoomWs: setRoomWs,
  };

  const [state, setState] = useState(initState);

  return (
    <AppContext.Provider value={state}>{props.children}</AppContext.Provider>
  );
};
