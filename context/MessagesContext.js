import React, {useState} from 'react';

export const MessagesContext = React.createContext({
  messages: [],
  setMessages: () => {},
});

export const MessagesContextProvider = props => {
  const setMessages = messages => {
    setState({...state, messages: messages});
  };

  const initState = {
    messages: [],
    setMessages: setMessages,
  };

  const [state, setState] = useState(initState);

  return (
    <MessagesContext.Provider value={state}>
      {props.children}
    </MessagesContext.Provider>
  );
};
