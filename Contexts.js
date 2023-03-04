import { createContext } from 'react';

export const AuthContext = createContext({
  hasUser: false, 
  setUser: () => {},
});
