import { Camera, CameraType } from "expo-camera";
import { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CameraComp() {
    let cameraRef = useRef();
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [openCamera, setOpencamera] = useState(false);
// const [takePicture, setTakePicture] = useState(Camera.takePictureAsync)
    const [photo, setPhoto] = useState();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }


  async function takePic(){
    let options ={
        quality : 1,
        base64: true,
        exif: false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  if(photo){
    console.log(photo.uri)
  }
  return (
    <View style={styles.container}>
      {openCamera ? (
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setOpencamera(!openCamera)}
          >
            <Text style={styles.text}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={takePic}
          >
            <Text style={styles.text}>Click</Text>
          </TouchableOpacity>
        </Camera> 
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setOpencamera(!openCamera)}
        >
          <Text style={styles.cameraOpenText}>Open</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  cameraOpenText: {
    margin: 160,
    height: 50,
    width: 50,
    fontSize: 10,
  },
});
