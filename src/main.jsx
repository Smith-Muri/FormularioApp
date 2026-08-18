import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {Router} from './components/Router/Router'

import {BrowserRouter} from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <BrowserRouter>
      <Router />
    </BrowserRouter>

  </StrictMode>,
)
