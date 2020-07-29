import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';
import { Easing } from 'react-native-reanimated';
import ScrollBottomSheet, {
  SectionList,
} from 'react-native-scroll-bottom-sheet';
import { createMockData } from '../utils';
import Handle from '../components/Handle';
import Transaction from '../components/Transaction';
import { useSafeArea } from 'react-native-safe-area-context';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');
const statusBarHeight = StatusBar.currentHeight ?? 0;
const navBarHeight = 56;

const sections = createMockData();

const SectionListExample = () => {
  // hooks
  const { top: topSafeArea, bottom: bottomSafeArea } = useSafeArea();

  // variables
  const snapPointsFromTop = useMemo(
    () => [topSafeArea, '50%', windowHeight - 264],
    [topSafeArea]
  );

  const contentContainerStyle = useMemo(
    () => ({
      ...styles.contentContainerStyle,
      paddingBottom: bottomSafeArea,
    }),
    [bottomSafeArea]
  );

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View style={styles.section}>
        <Text>{section.title}</Text>
      </View>
    ),
    []
  );

  const renderItem = useCallback(({ item }) => <Transaction {...item} />, []);

  const renderHandle = useCallback(() => {
    return <Handle style={styles.handle} />;
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.balanceContainer}>
        <Text style={styles.poundSign}>£</Text>
        <Text style={styles.balance}>4,345</Text>
      </View>
      <ScrollBottomSheet
        topInset={statusBarHeight + navBarHeight}
        snapPoints={snapPointsFromTop}
        initialSnapIndex={1}
        animationConfig={{
          duration: 125,
          easing: Easing.out(Easing.exp),
        }}
        renderHandle={renderHandle}
      >
        <SectionList
          contentContainerStyle={contentContainerStyle}
          stickySectionHeadersEnabled
          sections={sections}
          keyExtractor={i => i.id}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          removeClippedSubviews={
            Platform.OS === 'android' && sections.length > 0
          }
        />
      </ScrollBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'black',
  },
  contentContainerStyle: {
    backgroundColor: 'white',
  },
  handle: {
    paddingVertical: 20,
    backgroundColor: '#F3F4F9',
  },
  card: {
    width: windowWidth - 128,
    height: (windowWidth - 128) / 1.57,
    alignSelf: 'center',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  section: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F9',
    borderWidth: 0.5,
    borderColor: '#B7BECF',
  },
  row: {
    marginTop: 24,
    width: windowWidth - 128,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: windowWidth - 256,
    marginBottom: 24,
    borderRadius: 4,
  },
  action: {
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#81D4FA',
    marginBottom: 8,
  },
  poundSign: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingTop: 8,
  },
});

export default SectionListExample;
