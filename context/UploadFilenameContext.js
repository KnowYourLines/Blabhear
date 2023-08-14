import React, {useState} from 'react';

export const UploadFilenameContext = React.createContext({
  uploadFilename: '',
  setUploadFilename: () => {},
});

export const UploadFilenameContextProvider = props => {
  const setUploadFilename = uploadFilename => {
    setState({...state, uploadFilename: uploadFilename});
  };

  const initState = {
    uploadFilename: '',
    setUploadFilename: setUploadFilename,
  };

  const [state, setState] = useState(initState);

  return (
    <UploadFilenameContext.Provider value={state}>
      {props.children}
    </UploadFilenameContext.Provider>
  );
};
