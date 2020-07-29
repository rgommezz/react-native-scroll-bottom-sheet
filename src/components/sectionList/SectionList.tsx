import React, { useMemo } from 'react';
import {
  SectionList as RNSectionList,
  SectionListProps as RNSectionListProps,
  ViewStyle,
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { useScrollBottomSheet } from '../../hooks';

const AnimatedSectionList = Reanimated.createAnimatedComponent(
  RNSectionList
) as React.ComponentClass<
  Reanimated.AnimateProps<ViewStyle, RNSectionListProps<any>>,
  any
>;

type SectionListProps<T> = Omit<
  RNSectionListProps<T>,
  | 'ref'
  | 'overScrollMode'
  | 'bounces'
  | 'decelerationRate'
  | 'onScrollBeginDrag'
  | 'scrollEventThrottle'
>;

function SectionList<Item>(props: SectionListProps<Item>) {
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
  const contentContainerStyle = useMemo(() => {
    return {
      // @ts-ignore
      ..._contentContainerStyle,
      paddingBottom:
        contentPaddingBottom + (_contentContainerStyle?.paddingBottom ?? 0),
    };
  }, [_contentContainerStyle, contentPaddingBottom]);

  // render
  return (
    <NativeViewGestureHandler
      ref={scrollComponentRef}
      waitFor={masterDrawerRef}
      simultaneousHandlers={drawerContentRef}
    >
      <AnimatedSectionList
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

export default SectionList;
