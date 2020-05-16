import * as React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';
import MapView from 'react-native-maps';
import Faker from 'faker';
import Animated, {
  Extrapolate,
  interpolate,
  Value,
} from 'react-native-reanimated';

interface Props {
  navigation: StackNavigationProp<HomeStackParamsList, 'HorizontalFlatList'>;
}

const initialRegion = {
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
  latitude: 51.5142431,
  longitude: -0.1255756,
};

function generateRandomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

const HorizontalFlatList: React.FC<Props> = () => {
  const snapPointsFromTop = [128, '50%', windowHeight - 200];
  const bottomSheetRef = React.useRef<ScrollBottomSheet<any> | null>(null);

  const animatedPosition = React.useRef(new Value(0));
  const opacity = interpolate(animatedPosition.current, {
    inputRange: [0, 1],
    outputRange: [0, 0.5],
    extrapolate: Extrapolate.CLAMP,
  });

  const renderItem = React.useCallback(
    () => (
      <View style={styles.item}>
        <Card>
          <Card.Cover
            style={styles.imageStyle}
            source={{
              uri: `https://picsum.photos/id/${generateRandomIntFromInterval(
                0,
                300
              )}/${Math.floor(windowWidth)}`,
            }}
          />
          <Card.Content>
            <Title style={{ marginTop: 8 }}>{Faker.address.streetName()}</Title>
            <Paragraph>{Faker.address.streetSuffix()}</Paragraph>
          </Card.Content>
        </Card>
      </View>
    ),
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
        componentType="ScrollView"
        topInset={24}
        animatedPosition={animatedPosition.current}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={2}
        renderHandle={() => (
          <View style={styles.header}>
            <View style={styles.panelHandle} />
          </View>
        )}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View style={styles.row} key={i}>
            <Text
              style={styles.title}
            >{`Popular in ${Faker.address.city()}`}</Text>
            <FlatList
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              initialNumToRender={2}
              data={Array.from({ length: 5 }).map(
                (_, index) => `Item ${index}`
              )}
              horizontal
              keyExtractor={j => j}
              renderItem={renderItem}
            />
          </View>
        ))}
      </ScrollBottomSheet>
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
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5.0,
    elevation: 16,
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    marginBottom: 10,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  row: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomColor: '#E0E0E0',
  },
  title: {
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageStyle: {
    width: windowWidth - 32,
    resizeMode: 'cover',
  },
});

export default HorizontalFlatList;
