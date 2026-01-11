import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';


import './styles/reset.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/guestbook.css';
import './styles/diary.css';
import './styles/video.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);