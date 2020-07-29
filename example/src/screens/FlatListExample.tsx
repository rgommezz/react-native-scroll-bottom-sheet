import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ScrollBottomSheet, { FlatList } from 'react-native-scroll-bottom-sheet';
import { useSafeArea } from 'react-native-safe-area-context';

const windowHeight = Dimensions.get('window').height;

const data = Array.from({ length: 20 }).map((_, i) => String(i));

const FlatListExample = () => {
  // hooks
  const { top: topSafeArea, bottom: bottomSafeArea } = useSafeArea();

  // variables
  const snapPointsFromTop = useMemo(
    () => [topSafeArea, '50%', windowHeight - 264],
    [topSafeArea]
  );

  // styles
  const contentContainerStyle = useMemo(
    () => ({
      ...styles.contentContainerStyle,
      paddingBottom: bottomSafeArea,
    }),
    [bottomSafeArea]
  );

  // renders
  const renderHandle = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.panelHandle} />
      </View>
    ),
    []
  );
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text>{`Item ${item}`}</Text>
      </View>
    ),
    []
  );
  return (
    <View style={styles.container}>
      <ScrollBottomSheet
        snapPoints={snapPointsFromTop}
        initialSnapIndex={2}
        renderHandle={renderHandle}
      >
        <FlatList
          data={data}
          keyExtractor={i => i}
          renderItem={renderItem}
          contentContainerStyle={contentContainerStyle}
        />
      </ScrollBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  contentContainerStyle: {
    padding: 16,
    backgroundColor: '#F3F4F9',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
  },
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default FlatListExample;
