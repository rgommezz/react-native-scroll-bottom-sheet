import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

const Handle: React.FC<Props> = ({ children, style }) => {
  const containerStyle = useMemo(() => [styles.header, style], [style]);
  return (
    <View style={containerStyle}>
      {children || <View style={styles.panelHandle} />}
    </View>
  );
};

export default Handle;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5.0,
    elevation: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
  },
});
