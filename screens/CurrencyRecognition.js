import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import CustomButton from "../utils/CustomButton";
import { backend_ip } from "../constants/constants";

const setCameraConfig = () => {
  Camera.Constants.VideoQuality['1080p'];
  Camera.Constants.AutoFocus.on
}

const CurrencyRecognition = ({ navigation }) => {

  const [hasPermission, setHasPermission] = useState(null);
  const [micPermission, setMicPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [cameraRef, setCameraRef] = useState(null)
  const [recording, setRecording] = useState(null);
  const [mode, setMode] = useState('camera')
  const [predictions, setPredictions] = useState(null)

  setCameraConfig()

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []
  );

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      setMicPermission(status === 'granted');
    })();
  }, []
  );

  if (hasPermission === null || micPermission === null) {
    return <View />;
  }
  if (hasPermission === false || micPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const speak = (thingToSay) => {
    Speech.speak(thingToSay);
  };

  async function sendVideo(video) {
    speak("Kindly wait while we are analysing the denomination of your currency note!")
    console.log('video', video);
    let formData = new FormData();
    formData.append("videoFile", {
      name: "video",
      uri: video.uri,
      type: 'video/mp4'
    });

    try {
      let response = await fetch(backend_ip + "/currency", {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });
      const prediction = await response.json();
      console.log(prediction)
      setPredictions(prediction["prediction"])
      speak(prediction["prediction"])
      setMode('prediction')
      return prediction;
    }
    catch (error) {
      console.log('error : ' + error);
      return error;
    }
  }

  const loadScreen = () => {

    if (mode === 'camera') {
      return (
        <Camera style={{ flex: 1 }} type={type} ratio='1:1' ref={ref => { setCameraRef(ref) }}>
          <View style={{
            flex: 1,
            width: Dimensions.get('window').width,
            backgroundColor: 'transparent',
            justifyContent: 'flex-end'
          }}>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly'
            }}>
              <TouchableOpacity style={{ alignSelf: 'center' }} onPress={async () => {
                if (!recording) {
                  setRecording(true)
                  let video = await cameraRef.recordAsync({ maxDuration: 3, mute: true });
                  setTimeout(() => { }, 3100);

                  console.log("Started!!!")
                  console.log(sendVideo(video))
                  console.log("Done!!!")
                  setMode('loading')

                  setRecording(false)
                } else {
                  setRecording(false)
                  cameraRef.stopRecording()
                }
              }}>
                <View
                  style={{
                    borderWidth: 2,
                    borderRadius: 25,
                    borderColor: 'red',
                    height: 50,
                    width: 50,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: 20
                  }}
                >
                  <View
                    style={{
                      borderWidth: 2,
                      borderRadius: 25,
                      borderColor: 'red',
                      height: 40,
                      width: 40,
                      backgroundColor: 'red',
                    }}
                  >
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      )

    }
    else if (mode === 'loading') {
      return (
        <View style={styles.imageContainer}>
          <Image source={require('../assets/loading.gif')} style={styles.image} resizeMode="cover" />
        </View>
      )
    }
    else {
      return (
        <View>
          {predictions === 'No Currency Note detected. Please place the currency note correctly below the camera and try again.' ?
            <View style={styles.imageContainer}>
              <Image source={require('../assets/try-again.gif')} style={styles.image} resizeMode="cover" />
              <View style={{ marginVertical: 30, alignItems: 'center' }}>
                <CustomButton text="Play Again" onPress={() => speak(predictions)} />
              </View>
            </View> :
            <View style={styles.imageContainer}>
              <Image source={require('../assets/assigning-an-eye-to-android.gif')} style={styles.image} resizeMode="cover" />
              <View style={{ marginVertical: 30, alignItems: 'center' }}>
                <CustomButton text="Play Again" onPress={() => speak(predictions)} />
              </View>
            </View>}
        </View>
      )
    }
  }

  return (
    <>
      <View style={styles.container}>
        {loadScreen()}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#ffffff'
  },
  image: {
    height: Dimensions.get('window').width,
    width: Dimensions.get('window').width
  },
  imageContainer: {
    height: Dimensions.get('window').height * 0.63
  },
});

export default CurrencyRecognition;
