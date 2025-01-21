import React from 'react';
import './index.css';
import App from './App';
import ReactDOM from 'react-dom/client';
import {BrowserRouter }  from "react-router-dom";
// import 'stream-browserify';
// import 'path-browserify';
// import 'os-browserify/browser';
// import 'crypto-browserify';


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);