import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';

const windowHeight = Dimensions.get('window').height;
const snapPointsFromTop = [128, '50%', windowHeight - 56 - 24];

export default function App() {
  const renderItem = React.useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text>{`This is ${item}`}</Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <ScrollBottomSheet<string>
        componentType="FlatList"
        topInset={24}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={2}
        renderHandle={() => (
          <View style={styles.header}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHandle} />
            </View>
          </View>
        )}
        contentContainerStyle={styles.contentContainerStyle}
        data={Array.from({ length: 200 }).map((_, i) => String(i))}
        keyExtractor={i => i}
        renderItem={renderItem}
      />
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
  header: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    shadowColor: '#000000',
    backgroundColor: '#F3F4F9',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 2,
    borderRadius: 4,
    backgroundColor: '#00000040',
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
