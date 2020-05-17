import * as React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import Animated, {
  Extrapolate,
  interpolate,
  Value,
} from 'react-native-reanimated';
import Handle from '../components/Handle';
import Carousel from '../components/Carousel';

interface Props {
  navigation: StackNavigationProp<
    HomeStackParamsList,
    'HorizontalFlatListExample'
  >;
}

const initialRegion = {
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
  latitude: 51.5142431,
  longitude: -0.1255756,
};
const { height: windowHeight } = Dimensions.get('window');
const snapPointsFromTop = [128, '50%', windowHeight - 128];

const HorizontalFlatListExample: React.FC<Props> = () => {
  const bottomSheetRef = React.useRef<ScrollBottomSheet<any> | null>(null);

  const animatedPosition = React.useRef(new Value(0));
  const opacity = interpolate(animatedPosition.current, {
    inputRange: [0, 1],
    outputRange: [0, 0.5],
    extrapolate: Extrapolate.CLAMP,
  });

  const renderRow = React.useCallback(
    ({ index }) => <Carousel index={index} />,
    []
  );

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'black', opacity },
        ]}
      >
        <Ionicons
          style={{ position: 'absolute', top: 32, right: 24 }}
          name="md-close"
          size={32}
          color="white"
          onPress={() => {
            bottomSheetRef.current?.snapTo(2);
          }}
        />
      </Animated.View>
      <ScrollBottomSheet<string>
        ref={bottomSheetRef}
        componentType="FlatList"
        topInset={24}
        animatedPosition={animatedPosition.current}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={2}
        renderHandle={() => <Handle />}
        keyExtractor={i => `row-${i}`}
        initialNumToRender={5}
        contentContainerStyle={styles.contentContainerStyle}
        data={Array.from({ length: 20 }).map((_, i) => String(i))}
        renderItem={renderRow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    backgroundColor: '#F3F4F9',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default HorizontalFlatListExample;
