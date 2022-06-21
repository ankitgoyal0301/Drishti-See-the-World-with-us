import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import Card from "../utils/Card";
import * as Speech from 'expo-speech';
import LocationSharing from "./LocationSharing";

const Home = (props) => {
  return (
    <View style={styling.container}>
      <ScrollView >
        <View style={{ alignItems: 'center', marginTop: '4%' }}>
          <Card text="Currency Recognition" onPress={() => {
            props.navigation.navigate({ name: "Currency Recognition" })
            Speech.speak("Kindly place your currency note below the camera and press the button!")
          }
          } />
        </View>

        <View style={{ alignItems: 'center', marginTop: '4%' }}>
          <Card text="Text Detection - Non Document" onPress={() => {
            props.navigation.navigate({ name: "Text Detection", params: { type: 'non-doc' } })
            Speech.speak("Kindly place the object with the text below the camera and press the button!")
          }
          } />
        </View>

        <View style={{ alignItems: 'center', marginTop: '4%' }}>
          <Card text="Text Detection - Document" onPress={() => {
            props.navigation.navigate({ name: "Text Detection", params: { type: 'doc' } })
            Speech.speak("Kindly place the document with the text below the camera and press the button!")
          }
          } />
        </View>
        {/* <LocationSharing /> */}
        <View style={{ alignItems: 'center', marginTop: '4%' }}>
          <Card text="Live Location Sharing" onPress={() => {
            props.navigation.navigate({ name: "Location" })
            Speech.speak("Kindly add the gaurdians and enable the toggle to start live location sharing!")
          }
          } />
        </View>
      </ScrollView>
    </View>
  );
};

const styling = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
    paddingBottom: '5%'
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 100,
    // marginBottom: 10
  },
  textInButton: {
    fontWeight: "600",
  },
});

export default Home;
