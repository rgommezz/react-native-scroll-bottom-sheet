import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/Home';
import FlatListExampleScreen from './screens/FlatListExample';
import SectionListExampleScreen from './screens/SectionListExample';
import ScrollViewExampleScreen from './screens/ScrollViewExample';

export type HomeStackParamsList = {
  Home: undefined;
  FlatListExample: undefined;
  SectionListExample: undefined;
  ScrollViewExample: undefined;
};

const Stack = createStackNavigator<HomeStackParamsList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" headerMode="none">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="FlatListExample"
          component={FlatListExampleScreen}
        />
        <Stack.Screen
          name="SectionListExample"
          component={SectionListExampleScreen}
        />
        <Stack.Screen
          name="ScrollViewExample"
          component={ScrollViewExampleScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
