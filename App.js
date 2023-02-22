import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthContext } from './Contexts.js'
import { AuthHelper } from './components/AuthHelper.js';

export default function App() {
  const [hasUser, setUser] = useState(false);

  return (
    <AuthContext.Provider value={{ hasUser, setUser }}>
      <PaperProvider>
        <NavigationContainer>
          <AuthHelper />
        </NavigationContainer>
      </PaperProvider>
    </AuthContext.Provider>
  );
}
