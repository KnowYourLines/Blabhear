import React, {useState} from 'react';

export const MessagePageContext = React.createContext({
  messagePage: null,
  setMessagePage: () => {},
});

export const MessagePageContextProvider = props => {
  const setMessagePage = messagePage => {
    setState({...state, messagePage: messagePage});
  };

  const initState = {
    messagePage: null,
    setMessagePage: setMessagePage,
  };

  const [state, setState] = useState(initState);

  return (
    <MessagePageContext.Provider value={state}>
      {props.children}
    </MessagePageContext.Provider>
  );
};
