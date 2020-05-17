import * as React from 'react';
import { AntDesign } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/Home';
import SectionListExample from './screens/SectionListExample';
import HorizontalFlatListExample from './screens/HorizontalFlatListExample';

export type HomeStackParamsList = {
  Home: undefined;
  SectionListExample: undefined;
  HorizontalFlatListExample: undefined;
};

const Stack = createStackNavigator<HomeStackParamsList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerTitle: 'Scroll Bottom Sheet Example' }}
        />
        <Stack.Screen
          options={{
            headerTitleAlign: 'center',
            headerTitle: 'Personal Account',
            headerRight: () => (
              <AntDesign
                name="piechart"
                size={24}
                color="#5C6BC0"
                style={{ marginRight: 16 }}
              />
            ),
          }}
          name="SectionListExample"
          component={SectionListExample}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="HorizontalFlatListExample"
          component={HorizontalFlatListExample}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
