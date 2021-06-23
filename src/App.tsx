import React from 'react';
import {
  BrowserRouter as Router,
  Route, Switch
} from 'react-router-dom';
import { ToastProvider } from 'react-toast-notifications';
import './App.scss';
// import SideBar from './components/SideBar/index';
import ManagerFile from './pages/ManageFile';
import { StyledMainContent } from './styled';

const App = () => {
  return (
    <ToastProvider
      autoDismiss
      autoDismissTimeout={3000}
      placement="top-right"
    >
      <div>
        <Router>
          <div>
            {/* <SideBar/> */}
            <StyledMainContent>
              <Switch>
                <Route exact path="/">
                  <ManagerFile />
                </Route>
              </Switch>
            </StyledMainContent>
          </div>
        </Router>
      </div>
    </ToastProvider>
  );
}

export default App;
