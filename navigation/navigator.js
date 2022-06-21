import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CurrencyRecognition from "../screens/CurrencyRecognition";
import Home from "../screens/Home";
import LocationSharing from "../screens/LocationSharing";
import TextDetect from "../screens/TextDetection";

const Stack = createNativeStackNavigator();

function Navigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Drishti" component={Home} />
        <Stack.Screen
          name="Currency Recognition"
          component={CurrencyRecognition}
        />
        <Stack.Screen name="Text Detection" component={TextDetect} />
        <Stack.Screen name="Location" component={LocationSharing} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigator;
