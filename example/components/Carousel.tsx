import * as React from 'react';
import CarouselItem from './CarouselItem';
import { StyleSheet, Text, View } from 'react-native';
import Faker from 'faker';
import { FlatList } from 'react-native-gesture-handler';

const Carousel: React.FC<{ index: number }> = React.memo(
  ({ index }) => {
    const renderItem = React.useCallback(() => <CarouselItem />, []);

    return (
      <View style={[styles.row, { borderTopWidth: index === 0 ? 0 : 1 }]}>
        <Text style={styles.title}>{`Popular in ${Faker.address.city()}`}</Text>
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 8 }}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={5}
          data={Array.from({ length: 10 }).map((_, i) => String(i))}
          horizontal
          keyExtractor={j => `row-${index}-item-${j}`}
          renderItem={renderItem}
        />
      </View>
    );
  },
  () => true
);

const styles = StyleSheet.create({
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
});

export default Carousel;
