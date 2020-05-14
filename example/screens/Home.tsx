import * as React from 'react';
import { Button, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';

interface Props {
  navigation: StackNavigationProp<HomeStackParamsList, 'Home'>;
}

const Home: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
      <View style={{ marginBottom: 32 }}>
        <Button
          title="Simple FlatList"
          onPress={() => {
            navigation.navigate('VerticalFlatList');
          }}
        />
      </View>
      <Button
        title="Horizontal FlatList"
        onPress={() => {
          navigation.navigate('HorizontalFlatList');
        }}
      />
    </View>
  );
};

export default Home;
