import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import CustomButton from '../utils/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { backend_ip } from '../constants/constants';

export default function TextDetect(props) {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);

  const [camera, setCamera] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [mode, setMode] = useState('camera')
  const [predictions, setPredictions] = useState(null)

  const permisionFunction = async () => {
    // here is how you can get the camera permission
    const cameraPermission = await Camera.requestPermissionsAsync();

    setCameraPermission(cameraPermission.status === 'granted');

    const imagePermission = await ImagePicker.getMediaLibraryPermissionsAsync();
    console.log(imagePermission.status);

    setGalleryPermission(imagePermission.status === 'granted');

    if (
      imagePermission.status !== 'granted' &&
      cameraPermission.status !== 'granted'
    ) {
      alert('Permission for media access needed.');
    }
  };

  useEffect(() => {
    permisionFunction();
  }, []);

  const Speak = (thingToSay, options = null) => {
    console.log("This is what needs to speak")
    Speech.speak(thingToSay, options)
    console.log("Chalgaya?")
  };

  async function sendPhoto(photo) {
    if (props.route.params["type"] === 'doc') {
      Speak("Kindly wait while we are analyse and extract out the text from the document!")
    }
    else Speak("Kindly wait while we are analyse and extract out the text from the Object!")

    console.log('photo', photo.uri);
    // Speech.speak("Hello")
    let formData = new FormData();
    formData.append("file", {
      name: "photo",
      uri: photo.uri,
      type: 'image/jpeg'
    });

    try {
      let response = await fetch(backend_ip + "/text-" + props.route.params["type"], {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });
      // console.log("Just started: ")
      const prediction = await response.json();
      // Speech.speak("Hello Bishwash")
      // console.log("Predictions are: ")
      console.log(prediction)
      // console.log("post prediction working fine")
      // setPredictions(prediction["Prediction"])
      // Speech.speak("Hello")
      // console.log("So far so good, 67")
      if (prediction["success"] === "False") {
        console.log("Handled")
        Speech.speak("Image was not taken properly, please retry!")
      }
      else if (prediction["Prediction"].trim().length === 0) {
        Speech.speak("No text detected. Please place the camera properly!")
      }
      else if (prediction["Prediction"] === 'Error') {
        Speech.speak("Image was not taken properly, please retry!")
      }
      else Speak(prediction["Prediction"], {
        rate: 0.8,
      })

      setPredictions(prediction["Prediction"])
      setMode('prediction')
      return prediction;
    }
    catch (error) {
      console.log('error : ' + error);
      return error;
    }
  }

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      console.log(data.uri);
      setImageUri(data.uri);
      sendPhoto(data)
      setMode("loading")
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [1, 1],
      quality: 1,
    });

    console.log(result);
    if (!result.cancelled) {
      setImageUri(result.uri);
      sendPhoto(result)
    }
  };

  function loadUI() {
    if (mode === 'camera') {
      return (
        <View style={styles.cameraContainer}>
          <Camera
            ref={(ref) => setCamera(ref)}
            style={styles.fixedRatio}
            type={type}
          // ratio={'1:1'}
          />
          <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => takePicture()}>
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
          {/* <Button title={'Take Picture'} onPress={takePicture} /> */}
          {/* <Button title={'Gallery'} onPress={pickImage} /> */}
        </View>
        // { imageUri && <Image source={{ uri: imageUri }} style={{ flex: 1 }} /> }
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
          <View style={styles.imageContainer}>
            <Image source={require('../assets/assigning-an-eye-to-android.gif')} style={styles.image} resizeMode="cover" />
            {/* <Text>{predictions}</Text> */}
            <View style={{ marginVertical: 30, alignItems: 'center' }}>
              <CustomButton text="Play Again" onPress={() => Speak(predictions)} />
            </View>
          </View>
        </View>
      )
    }
  }

  return (
    <View style={styles.container}>
      {loadUI()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#ffffff'
  },
  cameraContainer: {
    flex: 1,

  },
  fixedRatio: {
    flex: 1,
    // aspectRatio: 1,
    width: Dimensions.get('window').width
  },
  button: {
    flex: 0.1,
    padding: 10,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  image: {
    height: Dimensions.get('window').width,
    width: Dimensions.get('window').width
  },
  imageContainer: {
    height: Dimensions.get('window').height * 0.63
  },
});