import React, {useState} from 'react';

export const UploadUrlContext = React.createContext({
  uploadUrl: '',
  setUploadUrl: () => {},
});

export const UploadUrlContextProvider = props => {
  const setUploadUrl = uploadUrl => {
    setState({...state, uploadUrl: uploadUrl});
  };

  const initState = {
    uploadUrl: '',
    setUploadUrl: setUploadUrl,
  };

  const [state, setState] = useState(initState);

  return (
    <UploadUrlContext.Provider value={state}>
      {props.children}
    </UploadUrlContext.Provider>
  );
};
