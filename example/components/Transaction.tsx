/**
 * Copyright (c) 2020 Raul Gomez Acuna
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

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
