import React from "react";
import { db } from "../firebaseConfig";

const TestFirestoreWrite = () => {
  const handleAddDocument = async () => {
    try {
      await db.collection("test_collection").add({
        name: "Test User",
        age: 30,
        city: "București"
      });
      console.log("Document adăugat cu succes!");
    } catch (error) {
      console.error("Eroare la adăugarea documentului:", error);
    }
  };

  return (
    <div>
      <h1>Testare Firebase Firestore</h1>
      <button onClick={handleAddDocument}>Adaugă document în Firestore</button>
    </div>
  );
};

export default TestFirestoreWrite;
