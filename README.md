# Scroll Bottom Sheet

Cross platform scrollable bottom sheet with virtualisation support and fully native animations, that integrates with all core scrollable components from React Native: [FlatList](https://reactnative.dev/docs/flatlist), [ScrollView](https://reactnative.dev/docs/scrollview) and [SectionList](https://reactnative.dev/docs/sectionlist). Also, it's 100% compatible with Expo.

## Features
- **Virtualisation support**: `FlatList` and `SectionList` components are 1st class citizens, as well as `ScrollView` :electron:
- **Peformant**: runs at 60 FPS even on low grade Android devices :iphone:
- **No native dependencies**: fully implemented in JS land, thanks to the powerful [Gesture Handler](https://github.com/software-mansion/react-native-gesture-handler) and [Reanimated](https://github.com/software-mansion/react-native-reanimated) libraries :muscle:
- **Support for horizontal FlatList/ScrollView**: allows for nice implementation of Google or Apple Maps bottom sheets types, where you have several horizontal lists embedded (i.e show recommended places). Take a look at one of the examples where that concept is illustrated :fire:
- **Expo compatible**: no need to eject to enjoy this component! :smiley:
- **Minimalistic**: exposes a set of fundamental props to control its behaviour :gear:
- **Support for interruptions**: animations can be interrupted by another gesture to avoid abrupt jumps on the component :point_down:
- **Imperative snapping**: for cases where you need to close the bottom sheet by pressing an external touchable :sunglasses:
- **Animate all the things**: you can animate other elements on the screen based on the bottom sheet position. See the examples attached :rocket:
- **TS definitions**: For those of you like me who can't look back to start a project in plain JS :hammer_and_wrench:

<br />
<br />

![](gifs/banking.gif)  |  ![](gifs/map.gif) |
:---------------------:|:------------------:|

<br />
<br />

## Installation

#### npm

```sh
npm i react-native-scroll-bottom-sheet
```

#### yarn
```sh
yarn add react-native-scroll-bottom-sheet
```

If you don't use Expo, you also need to install [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler) and [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) libraries along with this one.

## Usage

The below is an example using the core `FlatList` from React Native as the scrollable component.

```tsx
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';

const windowHeight = Dimensions.get('window').height;

function Example() {
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
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4
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
This is the list of exclusive props that are meant to be used to customise the bottom sheet behaviour.


| Name                      | Required | Type | Description |
| ------------------------- | -------- | ------- | ------------|
| `componentType`             | yes      | `string `       | 'FlatList', 'ScrollView', or 'SectionList' |
| `snapPoints`                | yes      | `Array<string \| number>`       | Array of numbers and/or percentages that indicate the different resting positions of the bottom sheet (in dp or %), **starting from the top**. If a percentage is used, that would translate to the relative amount of the total window height. If you want that percentage to be calculated based on the parent available space instead, for example to account for safe areas or navigation bars, use it in combination with `topInset` prop |
| `initialSnapIndex`          | yes      | `number`       | Index that references the initial resting position of the drawer, **starting from the top** |
| `renderHandle`              | yes      |  `() => React.ReactNode`      | Render prop for the handle, should return a React Element |
| `onSettle`                  | no       |  `(index: number) => void`       | Callback that is executed right after the bottom sheet settles in one of the snapping points. The new index is provided on the callback |
| `animatedPosition`          | no       |  `Animated.Value<number>`       | Animated value that tracks the position of the drawer, being: 0 => closed, 1 => fully opened |
| `animationConfig`           | no       | `{ duration: number, easing: Animated.EasingFunction }`         | Timing configuration for the animation, by default it uses a duration of 250ms and easing fn `Easing.inOut(Easing.linear)`  |
| `topInset`                  | no       | `number`  | This value is useful to provide an offset (in dp) when applying percentages for snapping points |
| `innerRef`                  | no       | `RefObject`  | Ref to the inner scrollable component (ScrollView, FlatList or SectionList), so that you can call its imperative methods. For instance, calling `scrollTo` on a ScrollView. In order to so, you have to use `getNode` as well, since it's wrapped into an _animated_ component: `ref.current.getNode().scrollTo({y: 0, animated: true})` |


### Inherited
Depending on the value of `componentType` chosen, the bottom sheet component will inherit its underlying props, being one of
[FlatListProps](https://reactnative.dev/docs/flatlist#props), [ScrollViewProps](https://reactnative.dev/docs/scrollview#props) or [SectionListProps](https://reactnative.dev/docs/sectionlist#props), so that you can tailor the scrollable content behaviour as per your needs.

## Methods

#### `snapTo(index)`

Imperative method to snap to a specific index, i.e.

```js
bottomSheetRef.current.snapTo(0)
```

`bottomSheetRef` refers to the [`ref`](https://reactjs.org/docs/react-api.html#reactcreateref) passed to the `ScrollBottomSheet` component.

## Typescript
The library has been written in Typescript, so you'll get type checking and autocompletion if you use it as well.

## License

MIT
