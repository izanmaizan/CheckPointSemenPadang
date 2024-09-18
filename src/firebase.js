// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyButEv37gXMS2_B2EE_trLGVTXtgVXWgNA",
    authDomain: "kara-byakta.firebaseapp.com",
    databaseURL: "https://kara-byakta-default-rtdb.firebaseio.com",
    projectId: "kara-byakta",
    storageBucket: "kara-byakta.appspot.com",
    messagingSenderId: "1080778476032",
    appId: "1:1080778476032:web:cf2c1faacb5d080caca6e5",
    measurementId: "G-TYSKNLK6R4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
