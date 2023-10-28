import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [apiData, setApiData] = useState();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "https://pg-api-45dn.onrender.com/coldata"
        );
        setApiData(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);


  return <ApiContext.Provider value={apiData}>{children}</ApiContext.Provider>;
};
