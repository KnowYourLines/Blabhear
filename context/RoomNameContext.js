import React, {useState} from 'react';

export const RoomNameContext = React.createContext({
  roomName: '',
  setRoomName: () => {},
});

export const RoomNameContextProvider = props => {
  const setRoomName = roomName => {
    setState({...state, roomName: roomName});
  };

  const initState = {
    roomName: '',
    setRoomName: setRoomName,
  };

  const [state, setState] = useState(initState);

  return (
    <RoomNameContext.Provider value={state}>
      {props.children}
    </RoomNameContext.Provider>
  );
};
