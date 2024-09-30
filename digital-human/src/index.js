import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SpeechProvider } from "./hooks/useSpeech";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SpeechProvider>
      <App />
    </SpeechProvider>
  </React.StrictMode>
);
