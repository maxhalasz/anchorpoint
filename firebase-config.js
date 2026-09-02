// AnchorPoint — Firebase client config.
// This is not a secret: it ships in client JS by design. Access is controlled
// entirely by the Realtime Database security rules (submissions = create-only,
// no read from the client). Read submissions in the Firebase console.
var firebaseConfig = {
  apiKey: "AIzaSyB78rez4yFlSP9hUG9w7wakfPBI6bq1exM",
  authDomain: "anchorpoint-arg.firebaseapp.com",
  databaseURL: "https://anchorpoint-arg-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "anchorpoint-arg",
  storageBucket: "anchorpoint-arg.firebasestorage.app",
  messagingSenderId: "723266130283",
  appId: "1:723266130283:web:fd3c71309d5358ddc3bc2e"
};

if (window.firebase && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
