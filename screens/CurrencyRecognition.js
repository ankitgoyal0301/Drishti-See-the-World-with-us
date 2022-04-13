import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";

const CurrencyRecognition = ({ navigation }) => {
  return (
    <>
      <View style={styling.container}>
        <Text>recognize Currency</Text>
      </View>
    </>
  );
};

const styling = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CurrencyRecognition;
