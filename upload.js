const admin = require("firebase-admin");
const data = require("./csvjson.json"); 

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const uploadData = async () => {
  const collectionRef = db.collection("date_csv"); 

  try {
    for (const item of data) {
      await collectionRef.add(item);
      console.log("Document adăugat:", item);
    }
    console.log("Date încărcate cu succes!");
  } catch (error) {
    console.error("Eroare la încărcare:", error);
  }
};

uploadData();
