import React from 'react';
import { StyleSheet, Text, View, Dimensions, Button } from 'react-native';
import Animated, {
  Value,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';

export default function App() {
  const windowHeight = Dimensions.get('window').height;
  const snapPointsFromTop = [128, '50%', windowHeight - 200];
  const bottomSheetRef = React.useRef<ScrollBottomSheet<any> | null>(null);

  const renderItem = React.useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text>{`This is ${item}`}</Text>
      </View>
    ),
    []
  );

  const animatedPosition = React.useRef(new Value(0));
  const opacity = interpolate(animatedPosition.current, {
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'black', opacity },
        ]}
      />
      <ScrollBottomSheet<string>
        ref={bottomSheetRef}
        componentType="FlatList"
        topInset={24}
        animatedPosition={animatedPosition.current}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={2}
        onSettle={index => {
          console.log('Next snap index: ', index);
        }}
        renderHandle={() => (
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <View style={styles.panelHandle} />
            </View>
          </View>
        )}
        contentContainerStyle={styles.contentContainerStyle}
        data={Array.from({ length: 200 }).map((_, i) => String(i))}
        keyExtractor={i => i}
        renderItem={renderItem}
      />
      <View style={[StyleSheet.absoluteFillObject]} pointerEvents="box-none">
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 24,
            padding: 32,
          }}
        >
          <Button
            title="snapTo 0"
            onPress={() => {
              bottomSheetRef.current?.snapTo(0);
            }}
          />
          <Button
            title="snapTo 1"
            onPress={() => {
              bottomSheetRef.current?.snapTo(1);
            }}
          />
          <Button
            title="snapTo 2"
            onPress={() => {
              bottomSheetRef.current?.snapTo(2);
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    padding: 24,
    backgroundColor: '#F3F4F9',
  },
  headerContainer: {
    overflow: 'hidden',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#F3F4F9',
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    paddingTop: 20,
    borderLeftColor: '#F3F4F9',
    borderRightColor: '#F3F4F9',
    borderTopColor: '#F3F4F9',
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
    height: 2,
    borderRadius: 4,
    marginBottom: 10,
  },
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
});
