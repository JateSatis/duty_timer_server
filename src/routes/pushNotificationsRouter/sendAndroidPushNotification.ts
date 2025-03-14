import admin from "firebase-admin";
// import serviceAccount from "../path/to/serviceAccountKey.json"; // Укажите путь к вашему serviceAccountKey

// Инициализация Firebase Admin SDK
admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
