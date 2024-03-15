import { createContext, useContext, useEffect, useState } from "react";
import { databases } from "../appwrite";
import { ID, Query } from "appwrite";
// import * as dotenv from 'dotenv';
// dotenv.config()

export const DATABASE_ID = process.env.REACT_APP_DATABASE_ID; // Replace with your database ID
export const COLLECTION_ID =
  process.env.REACT_APP_COLLECTION_ID_BABY_ACTIVITIES; // Replace with your collection ID

const BabyActivitiesContext = createContext();

export function useBabyActivities() {
  return useContext(BabyActivitiesContext);
}

export function BabyActivitiesProvider(props) {
  const [babyActivities, setBabyActivities] = useState([]);

  async function add(item, onSuccessAdd) {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      item
    );
    setBabyActivities((babyActivities) =>
      [response.$id, ...babyActivities].slice(0, 10)
    );
    await init();
    onSuccessAdd(item.activityName);
  }

  async function remove(id) {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
    setBabyActivities((babyActivities) =>
      babyActivities.filter((item) => item.$id !== id)
    );
    await init(); // Refetch babyActivities to ensure we have 10 items
  }

  async function sameActivityInTheLastOneHour(activityName) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
      Query.limit(1),
      Query.greaterThan("$createdAt", oneHourAgo.toISOString()),
      Query.equal("activityName", [activityName]),
    ]);
    console.log({ response });
    return response?.documents ?? [];
  }
  async function init() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
      // Query.limit(10),
      Query.greaterThan("$createdAt", twentyFourHoursAgo.toISOString()),
    ]);

    setBabyActivities(response.documents);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <BabyActivitiesContext.Provider
      value={{
        current: babyActivities,
        add,
        remove,
        sameActivityInTheLastOneHour,
      }}
    >
      {props.children}
    </BabyActivitiesContext.Provider>
  );
}
