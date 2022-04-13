import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CurrencyRecognition from "../screens/CurrencyRecognition";
import Home from "../screens/Home";
import TextDetect from "../screens/TextDetect";

const Stack = createNativeStackNavigator();

function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen
          name="Currency Recognition"
          component={CurrencyRecognition}
        />
        <Stack.Screen name="Text Detection" component={TextDetect} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
