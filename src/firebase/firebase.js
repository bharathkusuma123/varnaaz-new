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
  apiKey: "AIzaSyCDa_2s67IEGFmwgjHdUKLi9PoW-mbB6Hg",
  authDomain: "bkarts-11.firebaseapp.com",
  projectId: "bkarts-11",
  databaseURL: "https://bkarts-11-default-rtdb.firebaseio.com",
  storageBucket: "bkarts-11.appspot.com",
  messagingSenderId: "616704223125",
  appId: "1:616704223125:web:5d0e8e1dd0da1f9948389c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, serverTimestamp };

