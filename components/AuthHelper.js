import { AuthContext } from '../Contexts.js';
import { LoginScreen } from './LoginScreen.js';
import { MainNavigatorScreen } from './MainNavigatorScreen.js';

export const AuthHelper = () => {
  return (
    <AuthContext.Consumer>
      {({ hasUser }) => {
        let shownScreen;
        if (!hasUser) {
          shownScreen = <LoginScreen />;
        } else {
          shownScreen = <MainNavigatorScreen />;
        }
        
        return (
          shownScreen
        );
      }}
    </AuthContext.Consumer>
  );
};