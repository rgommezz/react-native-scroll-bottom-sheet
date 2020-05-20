import * as React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';
import { generateRandomIntFromInterval } from '../utils';
import Faker from 'faker';

const { width: windowWidth } = Dimensions.get('window');

const CarouselItem: React.FC = React.memo(
  () => {
    const [withPlaceholder, setPlaceholder] = React.useState(false);
    return (
      <View style={styles.item}>
        <Card>
          <Card.Cover
            style={styles.imageStyle}
            onError={() => setPlaceholder(true)}
            source={
              withPlaceholder
                ? require('../assets/placeholder.jpg')
                : {
                    uri: `https://picsum.photos/id/${generateRandomIntFromInterval(
                      0,
                      300
                    )}/${Math.floor(windowWidth)}`,
                  }
            }
          />
        </Card>
      </View>
    );
  },
  () => true
);

export default CarouselItem;

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  imageStyle: {
    width: (windowWidth - 32) / 1.5,
    height: 150,
    resizeMode: 'cover',
  },
});
