import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
window.storage={get:async(k)=>{try{const v=localStorage.getItem(k);return v?{key:k,value:v}:null;}catch{return null;}},set:async(k,v)=>{try{localStorage.setItem(k,v);return{key:k,value:v};}catch{return null;}},delete:async(k)=>{try{localStorage.removeItem(k);return{key:k,deleted:true};}catch{return null;}},list:async(p)=>{try{const keys=Object.keys(localStorage).filter(k=>!p||k.startsWith(p));return{keys};}catch{return{keys:[]};}}};
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
