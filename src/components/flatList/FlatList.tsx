import React, { useMemo } from 'react';
import {
  FlatList as RNFlatList,
  FlatListProps as RNFlatListProps,
  ViewStyle,
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { useScrollBottomSheet } from '../../hooks';

const AnimatedFlatList = Reanimated.createAnimatedComponent(
  RNFlatList
) as React.ComponentClass<
  Reanimated.AnimateProps<ViewStyle, RNFlatListProps<any>>,
  any
>;

type FlatListProps<T> = Omit<
  RNFlatListProps<T>,
  | 'ref'
  | 'overScrollMode'
  | 'bounces'
  | 'decelerationRate'
  | 'onScrollBeginDrag'
  | 'scrollEventThrottle'
>;

function FlatList<Item>(props: FlatListProps<Item>) {
  // props
  const { contentContainerStyle: _contentContainerStyle, ...rest } = props;

  // hooks
  const {
    innerRef,
    scrollComponentRef,
    masterDrawerRef,
    drawerContentRef,
    decelerationRate,
    contentPaddingBottom,
    onScrollBeginDrag,
  } = useScrollBottomSheet();

  // styles
  const contentContainerStyle = useMemo(
    () => [_contentContainerStyle, { paddingBottom: contentPaddingBottom }],
    [_contentContainerStyle, contentPaddingBottom]
  );

  // render
  return (
    <NativeViewGestureHandler
      ref={scrollComponentRef}
      waitFor={masterDrawerRef}
      simultaneousHandlers={drawerContentRef}
    >
      <AnimatedFlatList
        {...rest}
        ref={innerRef}
        overScrollMode="never"
        bounces={false}
        decelerationRate={decelerationRate}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={1}
        contentContainerStyle={contentContainerStyle}
      />
    </NativeViewGestureHandler>
  );
}

export default FlatList;
