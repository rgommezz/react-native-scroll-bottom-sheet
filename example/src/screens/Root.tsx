import React from 'react';
import Showcase from '@gorhom/showcase-template';
import { useNavigation } from '@react-navigation/native';
import { version, description } from '../../../package.json';

const data = [
  {
    title: 'FlatList',
    data: [
      {
        name: 'Default',
        slug: 'FlatListExample',
      },
    ],
  },
  {
    title: 'SectionList',
    data: [
      {
        name: 'Default',
        slug: 'SectionListExample',
      },
    ],
  },
  {
    title: 'ScrollView',
    data: [
      {
        name: 'Default',
        slug: 'ScrollViewExample',
      },
    ],
  },
];

const RootScreen = () => {
  // hooks
  const { navigate } = useNavigation();

  // callbacks
  const handleOnPress = (slug: string) => navigate(slug);

  // renders
  return (
    <Showcase
      theme="light"
      version={version}
      name="Scroll Bottom Sheet"
      description={description}
      author={{
        username: 'Raul Gomez Acuña',
        url: 'https://github.com/rgommezz',
      }}
      data={data}
      handleOnPress={handleOnPress}
    />
  );
};

export default RootScreen;
