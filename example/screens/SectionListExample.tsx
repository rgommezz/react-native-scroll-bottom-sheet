import React from 'react';
import Constants from 'expo-constants';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { Colors, ProgressBar } from 'react-native-paper';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';
import { createMockData, ListItemData } from '../utils';
import Handle from '../components/Handle';
import Transaction from '../components/Transaction';
import Animated, {
  concat,
  Easing,
  Extrapolate,
  interpolate,
  Value,
} from 'react-native-reanimated';

interface Props {
  navigation: StackNavigationProp<HomeStackParamsList, 'SectionListExample'>;
}

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');
const { statusBarHeight } = Constants;
const navBarHeight = 56;

const sections = createMockData();

const SectionListExample: React.FC<Props> = () => {
  const snapPointsFromTop = [96, '45%', windowHeight - 264];
  const animatedPosition = React.useRef(new Value(0.5));
  const handleLeftRotate = concat(
    interpolate(animatedPosition.current, {
      inputRange: [0, 0.4, 1],
      outputRange: [25, 0, 0],
      extrapolate: Extrapolate.CLAMP,
    }),
    'deg'
  );
  const handleRightRotate = concat(
    interpolate(animatedPosition.current, {
      inputRange: [0, 0.4, 1],
      outputRange: [-25, 0, 0],
      extrapolate: Extrapolate.CLAMP,
    }),
    'deg'
  );
  const cardScale = interpolate(animatedPosition.current, {
    inputRange: [0, 0.6, 1],
    outputRange: [1, 1, 0.9],
    extrapolate: Extrapolate.CLAMP,
  });

  const renderSectionHeader = React.useCallback(
    ({ section }) => (
      <View style={styles.section}>
        <Text>{section.title}</Text>
      </View>
    ),
    []
  );

  const renderItem = React.useCallback(
    ({ item }) => <Transaction {...item} />,
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.poundSign}>£</Text>
        <Text style={styles.balance}>4,345</Text>
      </View>
      <ProgressBar
        style={styles.progressBar}
        progress={0.8}
        color={Colors.green600}
      />
      <Animated.Image
        source={require('../assets/card-front.png')}
        style={[styles.card, { transform: [{ scale: cardScale }] }]}
      />
      <View style={styles.row}>
        <View>
          <View style={styles.action}>
            <FontAwesome5 name="credit-card" size={24} color="black" />
          </View>
          <Text style={{ textAlign: 'center' }}>Account</Text>
        </View>
        <View>
          <View style={styles.action}>
            <FontAwesome5 name="eye" size={24} color="black" />
          </View>
          <Text style={{ textAlign: 'center' }}>Pin</Text>
        </View>
        <View>
          <View style={styles.action}>
            <Ionicons name="md-snow" size={24} color="black" />
          </View>
          <Text style={{ textAlign: 'center' }}>Freeze</Text>
        </View>
        <View>
          <View style={styles.action}>
            <FontAwesome5 name="plus" size={24} color="black" />
          </View>
          <Text style={{ textAlign: 'center' }}>Top up</Text>
        </View>
      </View>
      <ScrollBottomSheet<ListItemData>
        removeClippedSubviews={Platform.OS === 'android' && sections.length > 0}
        componentType="SectionList"
        topInset={statusBarHeight + navBarHeight}
        animatedPosition={animatedPosition.current}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={1}
        animationConfig={{
          easing: Easing.inOut(Easing.linear),
        }}
        renderHandle={() => (
          <Handle style={{ paddingVertical: 20, backgroundColor: '#F3F4F9' }}>
            <Animated.View
              style={[
                styles.handle,
                {
                  left: windowWidth / 2 - 20,
                  transform: [{ rotate: handleLeftRotate }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.handle,
                {
                  right: windowWidth / 2 - 20,
                  transform: [{ rotate: handleRightRotate }],
                },
              ]}
            />
          </Handle>
        )}
        contentContainerStyle={styles.contentContainerStyle}
        stickySectionHeadersEnabled
        sections={sections}
        keyExtractor={i => i.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  contentContainerStyle: {
    backgroundColor: 'white',
  },
  handle: {
    position: 'absolute',
    width: 22,
    height: 4,
    backgroundColor: '#BDBDBD',
    borderRadius: 4,
    marginTop: 17,
  },
  card: {
    width: windowWidth - 128,
    height: (windowWidth - 128) / 1.57,
    alignSelf: 'center',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  section: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F9',
    borderWidth: 0.5,
    borderColor: '#B7BECF',
  },
  row: {
    marginTop: 24,
    width: windowWidth - 128,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  balance: {
    fontWeight: 'bold',
    fontSize: 32,
  },
  progressBar: {
    width: windowWidth - 256,
    marginBottom: 24,
    borderRadius: 4,
  },
  action: {
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#81D4FA',
    marginBottom: 8,
  },
  poundSign: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingTop: 8,
  },
});

export default SectionListExample;
