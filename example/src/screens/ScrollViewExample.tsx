import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import ScrollBottomSheet, {
  ScrollView,
} from 'react-native-scroll-bottom-sheet';
import { useSafeArea } from 'react-native-safe-area-context';
import Handle from '../components/Handle';
import Button from '../components/button';
import ContactItem from '../components/contactItem';
import { createContactListMockData } from '../utils';

const windowHeight = Dimensions.get('window').height;

const ScrollViewExample = () => {
  // hooks
  const sheetRef = useRef<ScrollBottomSheet>(null);
  const { bottom: bottomSafeArea } = useSafeArea();
  const headerHeight = useHeaderHeight();

  // variables
  const data = useMemo(() => createContactListMockData(), []);
  const snapPoints = useMemo(() => ['10%', '50%', '80%'], []);

  // styles
  const sheetContainerStyle = useMemo(
    () => ({
      height: windowHeight - bottomSafeArea - headerHeight,
    }),
    [bottomSafeArea, headerHeight]
  );
  const contentContainerStyle = useMemo(
    () => ({
      ...styles.contentContainerStyle,
      paddingBottom: bottomSafeArea,
    }),
    [bottomSafeArea]
  );

  // callbacks
  const handleSnapPress = useCallback(index => {
    sheetRef.current?.snapTo(index);
  }, []);

  // renders
  const renderHandle = useCallback(() => <Handle />, []);
  const renderItem = useCallback(
    item => (
      <ContactItem key={item.name} title={item.name} subTitle={item.jobTitle} />
    ),
    []
  );
  return (
    <View style={styles.container}>
      <Button
        label="Extend"
        style={styles.buttonContainer}
        onPress={() => handleSnapPress(0)}
      />
      <Button
        label="Open"
        style={styles.buttonContainer}
        onPress={() => handleSnapPress(1)}
      />
      <Button
        label="Close"
        style={styles.buttonContainer}
        onPress={() => handleSnapPress(2)}
      />
      <ScrollBottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        initialSnapIndex={2}
        topInset={headerHeight}
        containerStyle={sheetContainerStyle}
        renderHandle={renderHandle}
      >
        <ScrollView contentContainerStyle={contentContainerStyle}>
          {data.map(renderItem)}
        </ScrollView>
      </ScrollBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  contentContainerStyle: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginBottom: 6,
  },
});

export default ScrollViewExample;
