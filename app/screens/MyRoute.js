import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { ApiContext } from "../context/ApiContext";

const MyRoute = ({ route }) => {
  const [listData, setListData] = useState([]);
  const selectedRoute = route.params.myRoute;
  const apiData = useContext(ApiContext);

  useEffect(() => {
    handleRoute();
  }, []);

  function handleRoute() {
    const filteredData = apiData.filter((item) => {
      return selectedRoute.some((e) => e.loanNo === item.loancardaccountno);
    });
    setListData(filteredData);
  }
  console.log(listData);
  return (
    <View>
      <Text>MyRoute</Text>
      {listData.map((item, index) => {
        return (
          <>
            <View key={index}>
              <Text>
                {index} Customer Name: {item.customername} Loan No:{" "}
                {item.loancardaccountno}
              </Text>
              {/* <Text>Loan No: {item.loancardaccountno}</Text> */}
            </View>
          </>
        );
      })}
    </View>
  );
};

export default MyRoute;

const styles = StyleSheet.create({});
