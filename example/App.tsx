import * as React from 'react';
import { AntDesign } from '@expo/vector-icons';
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
          name="VerticalFlatList"
          component={VerticalFlatList}
        />
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
