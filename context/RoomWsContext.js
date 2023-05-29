import React, {useState} from 'react';

export const RoomWsContext = React.createContext({
  roomWs: null,
  setRoomWs: () => {},
});

export const RoomWsContextProvider = props => {
  const setRoomWs = roomWs => {
    setState({...state, roomWs: roomWs});
  };

  const initState = {
    roomWs: null,
    setRoomWs: setRoomWs,
  };

  const [state, setState] = useState(initState);

  return (
    <RoomWsContext.Provider value={state}>{props.children}</RoomWsContext.Provider>
  );
};
