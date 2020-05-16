import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/Home';
import VerticalFlatList from './screens/VerticalFlatList';
import HorizontalFlatList from './screens/HorizontalFlatList';

export type HomeStackParamsList = {
  Home: undefined;
  VerticalFlatList: undefined;
  HorizontalFlatList: undefined;
};

const Stack = createStackNavigator<HomeStackParamsList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="VerticalFlatList" component={VerticalFlatList} />
        <Stack.Screen
          options={{ headerShown: false }}
          name="HorizontalFlatList"
          component={HorizontalFlatList}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
