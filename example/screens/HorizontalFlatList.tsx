import * as React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { FlatList } from 'react-native-gesture-handler';

interface Props {
  navigation: StackNavigationProp<HomeStackParamsList, 'HorizontalFlatList'>;
}

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

const HorizontalFlatList: React.FC<Props> = () => {
  const snapPointsFromTop = [0, '50%', windowHeight - 200];
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollBottomSheet<string>
        componentType="ScrollView"
        topInset={24}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={2}
        onSettle={index => {
          console.log('Next snap index: ', index);
        }}
        renderHandle={() => (
          <View style={styles.header}>
            <View style={styles.panelHandle} />
          </View>
        )}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <FlatList
            key={i}
            style={{ marginBottom: 64 }}
            pagingEnabled
            data={Array.from({ length: 10 }).map((_, index) => `Item ${index}`)}
            horizontal
            keyExtractor={j => j}
            renderItem={({ item }) => (
              <View
                style={{
                  height: 100,
                  justifyContent: 'center',
                  width: windowWidth - 64,
                  backgroundColor: 'green',
                  marginHorizontal: 16,
                  padding: 32,
                }}
              >
                <View style={{ backgroundColor: 'orange', flex: 1 }}>
                  <Text>{item}</Text>
                </View>
              </View>
            )}
          />
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
    padding: 16,
    backgroundColor: '#F3F4F9',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 20,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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

export default HorizontalFlatList;
