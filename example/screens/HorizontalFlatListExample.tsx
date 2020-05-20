import * as React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import Animated, {
  Extrapolate,
  interpolate,
  Value,
} from 'react-native-reanimated';
import Handle from '../components/Handle';
import Carousel from '../components/Carousel';
import { TouchableRipple } from 'react-native-paper';

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
const snapPointsFromTop = [96, '50%', windowHeight - 128];

const HorizontalFlatListExample: React.FC<Props> = ({ navigation }) => {
  const bottomSheetRef = React.useRef<ScrollBottomSheet<any> | null>(null);

  const animatedPosition = React.useRef(new Value(0));
  const opacity = interpolate(animatedPosition.current, {
    inputRange: [0, 1],
    outputRange: [0, 0.75],
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
      />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <TouchableRipple
          style={[styles.iconContainer, { right: 16 }]}
          onPress={() => {
            bottomSheetRef.current?.snapTo(2);
          }}
          borderless
        >
          <MaterialCommunityIcons
            name="close"
            size={32}
            color="white"
            style={styles.icon}
          />
        </TouchableRipple>
        {Platform.OS === 'ios' && (
          <TouchableRipple
            style={[styles.iconContainer, { left: 16 }]}
            onPress={() => {
              navigation.goBack();
            }}
            borderless
          >
            <Ionicons
              name="ios-arrow-back"
              size={32}
              color="white"
              style={styles.icon}
            />
          </TouchableRipple>
        )}
      </View>
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
        data={Array.from({ length: 100 }).map((_, i) => String(i))}
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
  iconContainer: {
    position: 'absolute',
    top: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    paddingTop: Platform.OS === 'ios' ? 4 : 0,
    paddingLeft: Platform.OS === 'ios' ? 2 : 0,
  },
  panelHandle: {
    width: 40,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    marginBottom: 10,
  },
});

export default HorizontalFlatListExample;
