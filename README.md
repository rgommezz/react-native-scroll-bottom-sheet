# Scroll Bottom Sheet

Cross platform scrollable bottom sheet with virtualisation support, with animations and gestures running at 60 FPS and fully implemented in JS land. It supports all core scrollable components from React Native: [FlatList](https://reactnative.dev/docs/flatlist), [ScrollView](https://reactnative.dev/docs/scrollview) and [SectionList](https://reactnative.dev/docs/sectionlist) :rocket:

## Installation

#### npm

```sh
npm i react-native-scroll-bottom-sheet
```

#### yarn
```sh
yarn add react-native-scroll-bottom-sheet
```

## Usage

The below is an example using the core `FlatList` from React Native as the scrollable component.

```js
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';

function Example() {
  const windowHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      <ScrollBottomSheet<string> // If you are using TS, that'll infer the renderItem `item` type
        componentType="FlatList"
        snapPoints={[128, '50%', windowHeight - 200]}
        initialSnapIndex={2}
        renderHandle={() => (
          <View style={styles.header}>
            <View style={styles.panelHandle} />
          </View>
        )}
        data={Array.from({ length: 200 }).map((_, i) => String(i))}
        keyExtractor={i => i}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{`Item ${item}`}</Text>
          </View>
        )}
        contentContainerStyle={styles.contentContainerStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    padding: 16,
    backgroundColor: '#F3F4F9',
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
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
});
```

## Props
There are 2 types of props this component receives: explicit and inherited.

### Explicit
This is the list of exclusive props the component receives, in order to customise its behaviour.


| name                      | required | type | description |
| ------------------------- | -------- | ------- | ------------|
| componentType             | yes      | `string `       | 'FlatList', 'ScrollView', or 'SectionList' |
| snapPoints                | yes      | `Array<string \| number>`       | Array of numbers that indicate the different resting positions of the bottom sheet (in dp or %), starting from the top. If a percentage is used, that would translate to the relative amount of the total window height. For instance, if 50% is used, that'd be `windowHeight * 0.5`. If you wanna take into account safe areas during the calculation, such as status bars and notches, please use it in combination with `topInset` prop |
| initialSnapIndex          | yes       | `number`       | Index that references the initial resting position of the drawer, starting from the top |
| renderHandle              | yes      |  `() => React.ReactNode`      | Render prop for the handle, should return a React Element |
| onSettle                  | no       |  `(index: number) => void`       | Callback that is executed right after the bottom sheet settles in one of the snapping points. The new index is provided on the callback |
| animatedPosition          | no       |  `Animated.Value<number>`       | Animated value that tracks the position of the drawer, being: 0 => closed, 1 => fully opened |
| animationConfig           | no       | `{ duration: number, easing: Animated.EasingFunction }`         | Timing configuration for the animation, by default it uses a duration of 250ms and easing fn `Easing.inOut(Easing.ease)`  |
| topInset                  | no       | `number`  | This value is useful if you want to take into consideration safe area insets when applying percentages for snapping points. We recommend using [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context#usage) for that. Look at `insets.top` |

### Inherited
Depending on the value of `componentType` chosen, the bottom sheet component will inherit its underlying props, being one of 
[FlatListProps](https://reactnative.dev/docs/flatlist#props), [ScrollViewProps](https://reactnative.dev/docs/scrollview#props) or [SectionListProps](https://reactnative.dev/docs/sectionlist#props)

## Methods

### `snapTo(index)`

Imperative method to snap to a specific index, i.e.

```js
bottomSheetRef.current.snapTo(0)
```

`bottomSheetRef` refers to the [`ref`](https://reactjs.org/docs/react-api.html#reactcreateref) passed to the `ScrollBottomSheet` component.

## Typescript
The library has been written in Typescript, so you'll get type checking and autocompletion if you use it as well.

## License

MIT
