import React, { createContext, useState, useContext, useCallback } from 'react';
import Alert from '../components/Alert';

const AlertContext = createContext();

export const useAlert = () => {
  return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    type: 'info', // 'info', 'success', 'error', 'warning'
    onClose: null,
  });

  const showAlert = useCallback((message, type = 'info', onClose) => {
    setAlertState({
      isOpen: true,
      message,
      type,
      onClose,
    });
  }, []);

  const hideAlert = useCallback(() => {
    if (alertState.onClose) {
      alertState.onClose();
    }
    setAlertState((prevState) => ({ ...prevState, isOpen: false }));
  }, [alertState]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Alert
        isOpen={alertState.isOpen}
        message={alertState.message}
        type={alertState.type}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
}; 