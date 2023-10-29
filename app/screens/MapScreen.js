import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Button,
} from "react-native";
import MapView, { Marker, Callout, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { ApiContext } from "../context/ApiContext";

export default function MapScreen({ navigation }) {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [magnetometerData, setMagnetometerData] = useState({});
  const [data, setData] = useState([]);
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  const response = useContext(ApiContext);

  const CustomPathMarker = ({ index }) => {
    return (
      <View style={styles.customPathMarker}>
        <Text style={styles.pathMarkerText}>{index + 1}</Text>
      </View>
    );
  };

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const fetchData = async () => {
    const addArr = [];
    if (response) {
      for (const e of response) {
        try {
          const locationData = await Location.geocodeAsync(e.pickupaddress1);
          if (locationData && locationData.length > 0) {
            addArr.push({
              address: e.pickupaddress1,
              name: e.customername,
              loanNo: e.loancardaccountno,
              latitude: locationData[0].latitude,
              longitude: locationData[0].longitude,
            });
          }
        } catch (err) {
          console.log("Error in geocoding: ", err);
        }
      }

      setData(addArr);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Permission to access location was denied");
        }
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        let { latitude, longitude } = location.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        setIsLoading(false);
        fetchData();
      } catch (error) {
        console.error("Error getting location: ", error);
        setErrorMsg("Error getting location");
        setIsLoading(false);
        fetchData();
      }
    })();

    _toggle = () => {
      if (this._subscription) {
        this._unsubscribe();
      } else {
        this._subscribe();
      }
    };

    _subscribe = () => {
      this._subscription = Magnetometer.addListener((result) => {
        setMagnetometerData(result);
      });
    };

    _unsubscribe = () => {
      this._subscription && this._subscription.remove();
      this._subscription = null;
    };

    return () => this._unsubscribe();
  }, []);

  const handleGetDirections = (latitude, longitude, loanNo) => {
    const newCoordinate = { latitude, longitude, loanNo };

    if (pathCoordinates.length > 0) {
      // Check if the last element in pathCoordinates is the same as the newCoordinate
      if (
        pathCoordinates[pathCoordinates.length - 1].latitude === latitude &&
        pathCoordinates[pathCoordinates.length - 1].longitude === longitude
      ) {
        // Remove the polyline and subsequent coordinates
        setPathCoordinates((prevCoordinates) => {
          // Find the index of the element that needs to be removed
          const index = prevCoordinates.findIndex(
            (coord) =>
              coord.latitude === latitude && coord.longitude === longitude
          );
          // If the index is found, remove all elements after that index
          if (index !== -1) {
            return prevCoordinates.slice(0, index);
          }
          return prevCoordinates;
        });
        return;
      }
    }

    // If the polyline and subsequent coordinates are not removed, add the new coordinate
    setPathCoordinates((prevCoordinates) => [
      ...prevCoordinates,
      newCoordinate,
    ]);

    // Calculate the total distance
    if (latitude && longitude && pathCoordinates.length > 0) {
      const lastCoordinate = pathCoordinates[pathCoordinates.length - 1];
      const distanceFromLastPoint = calculateDistance(
        lastCoordinate.latitude,
        lastCoordinate.longitude,
        latitude,
        longitude
      );
      const totalDistanceFromStart = pathCoordinates.reduce(
        (total, coord, index) => {
          if (index === 0) {
            return (
              total +
              calculateDistance(
                latitude,
                longitude,
                coord.latitude,
                coord.longitude
              )
            );
          } else {
            const prevCoord = pathCoordinates[index - 1];
            return (
              total +
              calculateDistance(
                prevCoord.latitude,
                prevCoord.longitude,
                coord.latitude,
                coord.longitude
              )
            );
          }
        },
        0
      );

      setTotalDistance(totalDistanceFromStart + distanceFromLastPoint);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  function handleMakeRoute() {
    navigation.navigate("My Route", { myRoute: pathCoordinates });
  }
  return (
    <SafeAreaView style={styles.container}>
     
      {latitude && longitude && (
        <MapView
          style={styles.map}
          showsUserLocation={true}
          followsUserLocation={true}
          loadingEnabled={true}
          loadingIndicatorColor="#666666"
          loadingBackgroundColor="#eeeeee"
          moveOnMarkerPress={false}
          showsCompass={true}
          rotateEnabled={true}
          camera={{
            center: { latitude, longitude },
            heading:
              magnetometerData && magnetometerData.magHeading
                ? magnetometerData.magHeading
                : 0,
            pitch: 45,
            altitude: 1000,
            zoom: 10,
          }}
        >
          <Marker
            coordinate={{ latitude: latitude, longitude: longitude }}
            title="My Location"
            showCallout
          >
            <Callout>
              <View>
                <Text>You are here</Text>
              </View>
            </Callout>
          </Marker>
          {data.map((e, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: e.latitude, longitude: e.longitude }}
              pinColor={"blue"}
              onPress={() =>
                handleGetDirections(e.latitude, e.longitude, e.loanNo)
              }
            >
              <Callout style={styles.calloutContainer}>
                <View style={styles.callout}>
                  <Text style={styles.calloutText}>{e.name}</Text>
                  <Text style={styles.calloutText}>{e.loanNo}</Text>
                  {latitude && longitude && (
                    <Text style={styles.calloutText}>
                      Distance:{" "}
                      {calculateDistance(
                        latitude,
                        longitude,
                        e.latitude,
                        e.longitude
                      ).toFixed(2)}{" "}
                      km
                    </Text>
                  )}
                  <Text
                    style={styles.calloutText}
                    onPress={() =>
                      handleGetDirections(e.latitude, e.longitude, e.loanNo)
                    }
                  >
                    Get Directions
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
          {pathCoordinates.length > 0 &&
            pathCoordinates.map((coordinate, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                }}
              >
                <CustomPathMarker index={index} />
              </Marker>
            ))}
          {pathCoordinates.length > 0 && (
            <Polyline
              coordinates={[
                { latitude: latitude, longitude: longitude },
                ...pathCoordinates,
              ]}
              strokeWidth={4}
              strokeColor="red"
            />
          )}
        </MapView>
      )}
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          Total Distance:{" "}
          {pathCoordinates.length > 0
            ? (
                calculateDistance(
                  latitude,
                  longitude,
                  pathCoordinates[0].latitude,
                  pathCoordinates[0].longitude
                ) + totalDistance
              ).toFixed(2)
            : totalDistance.toFixed(2)}{" "}
          km
        </Text>
      </View>
      <View style={{alignSelf: "flex-end",height:50}}>
      <View
        style={{
          // alignSelf: "flex-end",
          width:"100%",
          padding: 10,
          margin: 5,
          backgroundColor: "#ff5f5f",
          borderRadius: 5,
        }}
      >
        <TouchableOpacity onPress={handleMakeRoute}>
          <Text style={{ color: "white" }}>Make Route</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 25 : 0,
  },
  map: {
    width: "100%",
    height: "90%",
  },
  calloutContainer: {
    position: "absolute",
    bottom: 10,
    alignItems: "center",
  },
  callout: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  calloutText: {
    color: "black",
    fontWeight: "bold",
  },
  distanceContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 5,
  },
  distanceText: {
    color: "black",
    fontWeight: "bold",
  },
  customPathMarker: {
    borderColor: "white",

    marginBottom: 19,
  },
  pathMarkerText: {
    color: "white",
    fontWeight: "bold",
  },
});
