import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TasksProvider } from './lib/context/tasks';
import { AutomationsProvider } from './lib/context/automations';
import { UserProvider } from './lib/context/user';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <TasksProvider>
          <AutomationsProvider>
            <App />
            <Toaster position="top-right" />
          </AutomationsProvider>
        </TasksProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
); 