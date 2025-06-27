// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, updateDoc } from 'firebase/firestore';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // const firebaseConfig = {
// //   apiKey: "AIzaSyAwyl-bcH5HvqDAXp9De_cV1OAtM6l_gXs",
// //   authDomain: "varnaaz-new.firebaseapp.com",
// //   projectId: "varnaaz-new",
// //   storageBucket: "varnaaz-new.firebasestorage.app",
// //   messagingSenderId: "875492801442",
// //   appId: "1:875492801442:web:2db7fd6ac266c32bd190fb"
// // };




// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAIpsRhmMkF_cbWTYdBKiQNAsnlAvpGrJk",
//   authDomain: "varnaz-new.firebaseapp.com",
//   projectId: "varnaz-new",
//   storageBucket: "varnaz-new.firebasestorage.app",
//   messagingSenderId: "233301043923",
//   appId: "1:233301043923:web:09ca7cb778131b04f34226"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// export { db, collection, addDoc, updateDoc };




// firebase.js
// import { initializeApp } from "firebase/app";
// import { getFirestore, serverTimestamp } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyAgM_wRjG-DkfNsa0nmP2EHg3dScCdkNYo",
//   authDomain: "varnaz-new-2c882.firebaseapp.com",
//   projectId: "varnaz-new-2c882",
//   storageBucket: "varnaz-new-2c882.firebasestorage.app",
//   messagingSenderId: "230915408988",
//   appId: "1:230915408988:web:e782e9c734144cb0945299"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth(app);

// export { db, auth, serverTimestamp };


// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAO2WLo9kQcT8BX-Kg0ste53uVdis5DU0M",
  authDomain: "tickettracker-dedc6.firebaseapp.com",
  databaseURL: "https://tickettracker-dedc6-default-rtdb.firebaseio.com",
  projectId: "tickettracker-dedc6",
  storageBucket: "tickettracker-dedc6.appspot.com",
  messagingSenderId: "1075768501163",
  appId: "1:1075768501163:web:a05d81a9e1792c6bf128ee"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, serverTimestamp };

