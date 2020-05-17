import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, ProgressBar } from 'react-native-paper';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamsList } from '../App';
import { createMockData, ListItemData } from '../utils';
import Handle from '../components/Handle';
import Transaction from '../components/Transaction';

interface Props {
  navigation: StackNavigationProp<HomeStackParamsList, 'SectionListExample'>;
}

const windowHeight = Dimensions.get('window').height;

const sections = createMockData();

const SectionListExample: React.FC<Props> = () => {
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
    ({ item }) => <Transaction {...item} />,
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.poundSign}>£</Text>
        <Text style={styles.balance}>4,345</Text>
      </View>
      <ProgressBar
        style={styles.progressBar}
        progress={0.8}
        color={Colors.green600}
      />
      <Image source={require('../assets/card-front.png')} style={styles.card} />
      <ScrollBottomSheet<ListItemData>
        removeClippedSubviews={Platform.OS === 'android' && sections.length > 0}
        componentType="SectionList"
        topInset={24}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={0}
        renderHandle={() => <Handle />}
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
  balance: {
    fontWeight: 'bold',
    fontSize: 32,
  },
  progressBar: {
    width: Dimensions.get('window').width - 256,
    marginBottom: 8,
    borderRadius: 4,
  },
  poundSign: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingTop: 8,
  },
});

export default SectionListExample;
