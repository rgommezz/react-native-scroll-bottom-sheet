import * as React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

const Handle: React.FC<Props> = ({ children, style }) => (
  <View style={[styles.header, style]}>
    {children || <View style={styles.panelHandle} />}
  </View>
);

export default Handle;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
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
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    marginBottom: 10,
  },
});
