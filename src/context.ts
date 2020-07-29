import { createContext, RefObject } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

export interface ScrollBottomSheetContextType {
  innerRef?: RefObject<any>;
  scrollComponentRef?: RefObject<NativeViewGestureHandler>;
  drawerContentRef?: RefObject<PanGestureHandler>;
  masterDrawerRef?: RefObject<TapGestureHandler>;
  decelerationRate: Animated.Value<number>;
  contentPaddingBottom: number;
  onScrollBeginDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export const ScrollBottomSheetContext = createContext<
  ScrollBottomSheetContextType
>({
  innerRef: undefined,
  scrollComponentRef: undefined,
  drawerContentRef: undefined,
  masterDrawerRef: undefined,
  decelerationRate: new Animated.Value(0),
  contentPaddingBottom: 0,
  onScrollBeginDrag: () => {},
});
