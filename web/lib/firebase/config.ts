// Shared Firebase project (connect-cant) — same config + Firestore collections
// (`tattocategories`, `tattogalleryImages`) used by the tattoo-next-js gallery.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMiAkgEUAgyHyGiIH4V73kdizOAVOeif4",
  authDomain: "connect-cant.firebaseapp.com",
  projectId: "connect-cant",
  storageBucket: "connect-cant.appspot.com",
  messagingSenderId: "999730318693",
  appId: "1:999730318693:web:73dacd3134b9697393a58c",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export default app;
