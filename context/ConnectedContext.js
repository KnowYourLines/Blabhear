import React, {useState} from 'react';

export const ConnectedContext = React.createContext({
  connected: true,
  setConnected: () => {},
});

export const ConnectedContextProvider = props => {
  const setConnected = connected => {
    setState({...state, connected: connected});
  };

  const initState = {
    connected: true,
    setConnected: setConnected,
  };

  const [state, setState] = useState(initState);

  return (
    <ConnectedContext.Provider value={state}>
      {props.children}
    </ConnectedContext.Provider>
  );
};
