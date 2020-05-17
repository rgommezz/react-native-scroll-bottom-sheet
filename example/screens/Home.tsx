import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';
import { Button } from 'react-native-paper';

interface Props {
  navigation: StackNavigationProp<HomeStackParamsList, 'Home'>;
}

const Home: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.firstButton}>
        <Button
          mode="contained"
          onPress={() => {
            navigation.navigate('SectionListExample');
          }}
        >
          Bank - Section List
        </Button>
      </View>
      <Button
        mode="contained"
        onPress={() => {
          navigation.navigate('HorizontalFlatListExample');
        }}
      >
        Map - horizontal lists
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  firstButton: {
    marginBottom: 32,
  },
});

export default Home;
