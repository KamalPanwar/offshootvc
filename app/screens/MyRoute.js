import { SafeAreaView, StyleSheet, Text, View, StatusBar } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { ApiContext } from "../context/ApiContext";
import Constants from "expo-constants";

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

  return (
    <SafeAreaView style={styles.container}>
      {listData.map((item, index) => {
        return (
          <View key={index} style={styles.mainCard}>
            <View style={styles.indexContainer}>

            <Text style={{fontSize:30,color:"red"}}>{index}</Text>
            </View>
            <View>
              <Text>
                <Text style={{ fontWeight: 700 }}>Customer Name:</Text>
                {item.customername}
              </Text>
              <Text>
                <Text style={{ fontWeight: 700 }}>Loan No: </Text>
                {item.loancardaccountno}
              </Text>
              <Text>
                <Text style={{ fontWeight: 700 }}>Address : </Text>
                {item.pickupaddress1}
              </Text>
            </View>
          </View>
        );
      })}
    </SafeAreaView>
  );
};

export default MyRoute;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    padding: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    ...Platform.select({
      ios: {
        width: "80%", // Reduce container width on iOS
        alignSelf: "center", // Center the container on iOS
      },
    }),
  },
  mainCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  indexContainer:{
   
    width:"95%"
  },
 
});
