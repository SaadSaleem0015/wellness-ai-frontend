import { createContext, useState, useContext, ReactNode } from 'react';

type AppointmentPopupContextType = {
  showPopup: boolean;
  hideAppointmentPopup: () => void;
};

const AppointmentPopupContext = createContext<AppointmentPopupContextType | undefined>(undefined);

export function AppointmentPopupProvider({ children }: { children: ReactNode }) {
  const storedPopupValue = localStorage.getItem('showPopup');
  const [showPopup, setShowPopup] = useState<boolean>(storedPopupValue !== 'null'); 
  const hideAppointmentPopup = () => {
    setShowPopup(false);
    localStorage.setItem('showPopup', 'false'); 
  };

  return (
    <AppointmentPopupContext.Provider
      value={{
        showPopup,
        hideAppointmentPopup,
      }}
    >
      {children}
    </AppointmentPopupContext.Provider>
  );
}

export function useAppointmentPopup() {
  const context = useContext(AppointmentPopupContext);
  if (context === undefined) {
    throw new Error('useAppointmentPopup must be used within an AppointmentPopupProvider');
  }
  return context;
}
