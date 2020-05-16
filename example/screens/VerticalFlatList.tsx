import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { format, subDays, parse } from 'date-fns';
import { Colors, ProgressBar, List } from 'react-native-paper';
import Faker from 'faker';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';

interface Props {
  navigation: StackNavigationProp<HomeStackParamsList, 'VerticalFlatList'>;
}

interface ListItemProps {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  iconColor: string;
}

const windowHeight = Dimensions.get('window').height;

function generateRandomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const createMockData = () => {
  const elementsByDate: {
    [key: string]: ListItemProps[];
  } = {};
  const today = new Date();
  Array.from({ length: 200 }).forEach((_, index) => {
    const date = format(
      subDays(today, generateRandomIntFromInterval(0, 20)),
      'yyyy LL d'
    );
    const amount = (generateRandomIntFromInterval(100, 10000) / 100).toFixed(2);
    const randomEntry = {
      id: String(index),
      title: Faker.commerce.productName(),
      subtitle: Faker.commerce.productMaterial(),
      amount,
      iconColor: `rgb(${generateRandomIntFromInterval(
        0,
        255
      )}, ${generateRandomIntFromInterval(
        0,
        255
      )}, ${generateRandomIntFromInterval(0, 255)})`,
    };
    if (Array.isArray(elementsByDate[date])) {
      elementsByDate[date].push(randomEntry);
    } else {
      elementsByDate[date] = [randomEntry];
    }
  });

  return Object.entries(elementsByDate)
    .map(([key, data]) => ({
      title: key,
      data,
    }))
    .sort((a, b) => {
      return (
        parse(b.title, 'yyyy LL d', new Date()).getTime() -
        parse(a.title, 'yyyy LL d', new Date()).getTime()
      );
    })
    .map(item => ({
      ...item,
      title: format(parse(item.title, 'yyyy LL d', new Date()), 'ccc d MMM'),
    }));
};

const sections = createMockData();

const ListItem = React.memo(
  ({ title, subtitle, amount, iconColor }: ListItemProps) => (
    <List.Item
      title={title}
      description={subtitle}
      left={props => <List.Icon {...props} icon="folder" color={iconColor} />}
      right={() => <Text style={{ alignSelf: 'center' }}>{amount}</Text>}
    />
  ),
  () => true
);

const VerticalFlatList: React.FC<Props> = () => {
  const snapPointsFromTop = [128, '50%', windowHeight - 200];

  const renderSectionHeader = React.useCallback(
    ({ section }) => (
      <View style={styles.section}>
        <Text>{section.title}</Text>
      </View>
    ),
    []
  );

  const renderItem = React.useCallback(
    ({ item }) => <ListItem {...item} />,
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.dollar}>£</Text>
        <Text style={styles.balance}>4,345</Text>
      </View>
      <ProgressBar
        style={styles.progressBar}
        progress={0.8}
        color={Colors.green600}
      />
      <Image source={require('../assets/card-front.png')} style={styles.card} />
      <ScrollBottomSheet<ListItemProps>
        removeClippedSubviews={Platform.OS === 'android' && sections.length > 0}
        componentType="SectionList"
        topInset={24}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={0}
        renderHandle={() => (
          <View style={styles.header}>
            <View style={styles.panelHandle} />
          </View>
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
  card: {
    width: Dimensions.get('window').width - 128,
    height: 200,
    alignSelf: 'center',
    resizeMode: 'contain',
    borderRadius: 8,
  },
  section: {
    paddingVertical: 8,
    paddingHorizontal: 32,
    backgroundColor: '#F3F4F9',
    borderWidth: 0.5,
    borderColor: '#B7BECF',
  },
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  balance: { fontWeight: 'bold', fontSize: 32 },
  progressBar: {
    width: Dimensions.get('window').width - 256,
    marginBottom: 8,
    borderRadius: 4,
  },
  dollar: { fontWeight: 'bold', fontSize: 18, paddingTop: 8 },
});

export default VerticalFlatList;
