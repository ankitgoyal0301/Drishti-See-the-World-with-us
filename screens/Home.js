import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";

const Home = (props) => {
  return (
    <View style={styling.container}>
      <TouchableOpacity
        style={styling.button}
        onPress={() =>
          props.navigation.navigate({ name: "Currency Recognition" })
        }
      >
        <Text style={styling.textInButton}>Count Money</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styling.button}
        onPress={() => props.navigation.navigate({ name: "Text Detection" })}
      >
        <Text style={styling.textInButton}>Read Text</Text>
      </TouchableOpacity>
    </View>
  );
};

const styling = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: 10,
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
