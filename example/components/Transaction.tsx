import React from 'react';
import { ListItemData } from '../utils';
import { List } from 'react-native-paper';
import { Text } from 'react-native';

const Transaction = React.memo(
  ({ title, subtitle, amount, iconColor }: ListItemData) => (
    <List.Item
      title={title}
      description={subtitle}
      left={props => <List.Icon {...props} icon="folder" color={iconColor} />}
      right={() => (
        <Text style={{ alignSelf: 'center', marginRight: 8 }}>{amount}</Text>
      )}
    />
  ),
  () => true
);

export default Transaction;
