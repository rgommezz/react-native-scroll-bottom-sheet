import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';

interface HomeProps {
  navigation: StackNavigationProp<HomeStackParamsList, 'Home'>;
}

const Home = ({ navigation }: HomeProps) => {
  const handleFlatListPress = useCallback(() => {
    navigation.navigate('FlatListExample');
  }, [navigation]);

  const handleSectionListPress = useCallback(() => {
    navigation.navigate('SectionListExample');
  }, [navigation]);

  const handleScrollViewPress = useCallback(() => {
    navigation.navigate('ScrollViewExample');
  }, [navigation]);
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <TouchableHighlight
          style={styles.buttonContainer}
          onPress={handleFlatListPress}
        >
          <Text>FlatList Example</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.buttonContainer}
          onPress={handleSectionListPress}
        >
          <Text>SectionList Example</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.buttonContainer}
          onPress={handleScrollViewPress}
        >
          <Text>ScrollView Example</Text>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
});

export default Home;
