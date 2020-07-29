import React, { useMemo } from 'react';
import {
  ScrollView as RNScrollView,
  ScrollViewProps as RNScrollViewProps,
  ViewStyle,
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { useScrollBottomSheet } from '../../hooks';

const AnimatedScrollView = Reanimated.createAnimatedComponent(
  RNScrollView
) as React.ComponentClass<
  Reanimated.AnimateProps<ViewStyle, RNScrollViewProps>,
  any
>;

type ScrollViewProps = Omit<
  RNScrollViewProps,
  | 'ref'
  | 'overScrollMode'
  | 'bounces'
  | 'decelerationRate'
  | 'onScrollBeginDrag'
  | 'scrollEventThrottle'
> & {
  children: React.ReactNode[] | React.ReactNode;
};

const ScrollView = (props: ScrollViewProps) => {
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

  return (
    <NativeViewGestureHandler
      ref={scrollComponentRef}
      waitFor={masterDrawerRef}
      simultaneousHandlers={drawerContentRef}
    >
      <AnimatedScrollView
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
};

export default ScrollView;
