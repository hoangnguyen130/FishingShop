import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from '~/App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="33758602387-u923al0np09rd947uskpp7ph53vqfuoa.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>,
);

reportWebVitals();
