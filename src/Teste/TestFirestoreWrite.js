import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const TestFirestoreWrite = () => {
    const handleAddDocument = async () => {
      try {
        // `collection` specifică colecția și `addDoc` adaugă documentul în ea
        await addDoc(collection(db, "test_collection"), {
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