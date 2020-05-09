import React, { Component } from 'react';
import {
  Dimensions,
  FlatList,
  FlatListProps,
  Platform,
  ScrollViewProps,
  SectionList,
  SectionListProps,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  abs,
  add,
  and,
  call,
  Clock,
  clockRunning,
  cond,
  debug,
  Easing,
  eq,
  event,
  Extrapolate,
  greaterOrEq,
  greaterThan,
  interpolate,
  multiply,
  not,
  or,
  set,
  startClock,
  stopClock,
  sub,
  timing,
  Value,
} from 'react-native-reanimated';
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerProperties,
  ScrollView,
  State as GestureState,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { Assign } from 'utility-types';

const FlatListComponentType = 'FlatList' as const;
const ScrollViewComponentType = 'ScrollView' as const;
const SectionListComponentType = 'SectionList' as const;

const { height: windowHeight } = Dimensions.get('window');
const DRAG_TOSS = 0.05;

type AnimatedScrollableComponent = FlatList | ScrollView | SectionList;

type FlatListOption<T> = Assign<
  { componentType: typeof FlatListComponentType },
  FlatListProps<T>
>;
type ScrollViewOption = Assign<
  { componentType: typeof ScrollViewComponentType },
  ScrollViewProps
>;
type SectionListOption<T> = Assign<
  { componentType: typeof SectionListComponentType },
  SectionListProps<T>
>;

interface TimingParams {
  clock: Animated.Clock;
  from: Animated.Node<number>;
  to: Animated.Node<number>;
  duration: number;
}

type CommonProps = {
  /**
   * Array of numbers that indicate the different resting positions of the bottom sheet (in dp or %), starting from the top.
   */
  snapPoints: Array<string | number>;
  /**
   * Index that references the initial settled position of the drawer
   */
  initialSnapIndex: number;
  /**
   * Render prop for the handle
   */
  renderHandle: () => React.ReactNode;
  /**
   * Callback that is executed right after the drawer settles on one of the snapping points.
   * The new index is provided on the callback
   * @param index
   */
  onSettle?: (index: number) => void;
  /**
   * Animated value that tracks the position of the drawer, being:
   * 0 => closed
   * 1 => fully opened
   */
  animatedPosition?: Animated.Value<number>;
  /**
   * This value is useful if you want to take into consideration safe area insets
   * when applying percentages for snapping points. We recommend using react-native-safe-area-context
   * library for that.
   * @see https://github.com/th3rdwave/react-native-safe-area-context#usage, insets.top
   */
  topInset: number;
};

type Props<T> = CommonProps &
  (FlatListOption<T> | ScrollViewOption | SectionListOption<T>);

export class ScrollBottomSheet<T extends any> extends Component<Props<T>> {
  static defaultProps = {
    topInset: 0,
  };
  /**
   * Gesture Handler references
   */
  private drawerHandleRef = React.createRef<PanGestureHandler>();
  private drawerContentRef = React.createRef<PanGestureHandler>();
  private scrollComponentRef = React.createRef<NativeViewGestureHandler>();

  private iOSMasterDrawer = React.createRef<TapGestureHandler>();

  /**
   * Reference to FlatList, ScrollView or SectionList in order to execute its imperative methods.
   */
  private contentComponentRef = React.createRef<AnimatedScrollableComponent>();
  /**
   * Callback executed whenever we start scrolling on the Scrollable component
   */
  private onScrollBeginDrag: ScrollViewProps['onScrollBeginDrag'];
  private onHandleGestureEvent: PanGestureHandlerProperties['onGestureEvent'];
  private onDrawerGestureEvent: PanGestureHandlerProperties['onGestureEvent'];
  /**
   * Main Animated Value that drives the top position of the UI drawer at any point in time
   */
  private translateY: Animated.Node<number>;

  private scrollComponent: React.ComponentType<
    FlatListProps<T> | ScrollViewProps | SectionListProps<T>
  >;

  convertPercentageToDp = (str: string) =>
    (Number(str.split('%')[0]) * (windowHeight - this.props.topInset)) / 100;

  constructor(props: Props<T>) {
    super(props);
    const ScrollComponent = this.getScrollComponent();
    // @ts-ignore
    this.scrollComponent = Animated.createAnimatedComponent(ScrollComponent);
    const snapPoints = this.getNormalisedSnapPoints();
    console.log(snapPoints);
    const openPosition = snapPoints[0];
    const closedPosition = snapPoints[snapPoints.length - 1];
    const initialSnap = snapPoints[props.initialSnapIndex];
    const tempDestSnapPoint = new Value(0);

    const animationClock = new Clock();
    const dragY = new Value(0);
    const prevTranslateYOffset = new Value(initialSnap);
    const handleOldGestureState = new Value(-1);
    const drawerOldGestureState = new Value(-1);
    const velocityY = new Value(0);
    const lastStartScrollY = new Value(0);
    const translationY = new Value(initialSnap);
    const destSnapPoint = new Value(0);

    // Booleans transformed to animated values
    const lastSnap = new Value(initialSnap);
    const dragWithHandle = new Value(0);
    const scrollUpAndPullDown = new Value(0);
    const snapToDifferentThanTopWithHandle = new Value(0);

    this.onHandleGestureEvent = event([
      {
        nativeEvent: {
          translationY: dragY,
          oldState: handleOldGestureState,
          velocityY: velocityY,
        },
      },
    ]);
    this.onDrawerGestureEvent = event([
      {
        nativeEvent: {
          translationY: dragY,
          oldState: drawerOldGestureState,
          velocityY: velocityY,
        },
      },
    ]);
    this.onScrollBeginDrag = event([
      {
        nativeEvent: {
          contentOffset: { y: lastStartScrollY },
        },
      },
    ]);

    const didHandleGestureBegin = eq(handleOldGestureState, GestureState.BEGAN);

    const scrollY = cond(
      didHandleGestureBegin,
      [set(dragWithHandle, 1), 0],
      cond(eq(dragWithHandle, 1), 0, lastStartScrollY)
    );

    const didGestureFinish = or(
      eq(handleOldGestureState, GestureState.ACTIVE),
      eq(drawerOldGestureState, GestureState.ACTIVE)
    );

    const didScrollUpAndPullDown = cond(
      and(
        greaterOrEq(dragY, lastStartScrollY),
        greaterThan(lastStartScrollY, 0)
      ),
      set(scrollUpAndPullDown, 1)
    );

    const setTranslationY = cond(
      and(
        not(dragWithHandle),
        not(snapToDifferentThanTopWithHandle),
        not(greaterOrEq(dragY, lastStartScrollY))
      ),
      set(translationY, sub(dragY, lastStartScrollY)),
      set(translationY, dragY)
    );

    const extraOffset = cond(eq(scrollUpAndPullDown, 1), lastStartScrollY, 0);
    const endOffsetY = add(
      lastSnap,
      translationY,
      multiply(DRAG_TOSS, velocityY)
    );

    const currentSnapPoint = (i = 0): Animated.Node<number> | number =>
      i === snapPoints.length
        ? tempDestSnapPoint
        : cond(
            greaterThan(
              abs(sub(tempDestSnapPoint, endOffsetY)),
              abs(sub(add(snapPoints[i], extraOffset), endOffsetY))
            ),
            [
              set(tempDestSnapPoint, add(snapPoints[i], extraOffset)),
              currentSnapPoint(i + 1),
            ],
            currentSnapPoint(i + 1)
          );

    const runTiming = ({ clock, from, to, duration = 400 }: TimingParams) => {
      const state = {
        finished: new Value<0 | 1>(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0),
      };

      const config = {
        duration,
        toValue: new Value(0),
        easing: Easing.inOut(Easing.ease),
      };

      return [
        cond(clockRunning(clock), 0, [
          // If the clock isn't running we reset all the animation params and start the clock
          set(state.finished, 0),
          set(state.time, 0),
          set(state.position, from),
          set(state.frameTime, 0),
          set(config.toValue, to),
          startClock(clock),
        ]),
        // we run the step here that is going to update position
        timing(clock, state, config),
        // If the animation is over we stop the clock
        call([state.finished, lastSnap], ([finished, lastSnapValue]) => {
          if (finished === 1) {
            const decelerationRate = Platform.select({
              ios: 0.998,
              android: lastSnapValue === snapPoints[0] ? 0.985 : 0,
            });
            // @ts-ignore
            this.contentComponentRef.current?._component?.setNativeProps({
              decelerationRate,
              disableIntervalMomentum: false,
            });
          }
        }),
        cond(
          state.finished,
          [
            // Resetting appropriate values
            set(prevTranslateYOffset, state.position),
            cond(eq(scrollUpAndPullDown, 1), [
              set(
                prevTranslateYOffset,
                sub(prevTranslateYOffset, lastStartScrollY)
              ),
              set(lastStartScrollY, 0),
              set(scrollUpAndPullDown, 0),
            ]),
            cond(
              and(eq(dragWithHandle, 1), not(eq(destSnapPoint, snapPoints[0]))),
              set(snapToDifferentThanTopWithHandle, 1)
            ),
            cond(
              and(
                eq(snapToDifferentThanTopWithHandle, 1),
                eq(destSnapPoint, snapPoints[0])
              ),
              [
                // cond(eq(isAndroid, 1), set(lastEndScrollY, 0)),
                set(snapToDifferentThanTopWithHandle, 0),
                set(dragWithHandle, 0),
              ]
            ),
            stopClock(clock),
            prevTranslateYOffset,
          ],
          // We made the block return the updated position,
          state.position
        ),
      ];
    };

    const translateYOffset = cond(
      didGestureFinish,
      [
        didScrollUpAndPullDown,
        setTranslationY,
        set(tempDestSnapPoint, add(snapPoints[0], extraOffset)),
        set(destSnapPoint, currentSnapPoint()),
        set(dragY, 0),
        set(
          lastSnap,
          sub(
            destSnapPoint,
            cond(eq(didScrollUpAndPullDown, 1), lastStartScrollY, 0)
          )
        ),
        call([lastSnap], ([value]) => {
          // This is the TapGHandler trick on iOS
          // @ts-ignore
          this.iOSMasterDrawer?.current?.setNativeProps({
            maxDeltaY: value - this.getNormalisedSnapPoints()[0],
          });
        }),
        runTiming({
          clock: animationClock,
          from: add(prevTranslateYOffset, translationY),
          duration: 250,
          to: destSnapPoint,
        }),
      ],
      prevTranslateYOffset
    );

    this.translateY = interpolate(
      add(translateYOffset, dragY, multiply(scrollY, -1)),
      {
        inputRange: [openPosition, closedPosition],
        outputRange: [openPosition, closedPosition],
        extrapolate: Extrapolate.CLAMP,
      }
    );
  }

  getNormalisedSnapPoints = () => {
    return this.props.snapPoints.map(p => {
      if (typeof p === 'string') {
        return this.convertPercentageToDp(p);
      } else if (typeof p === 'number') {
        return p;
      }

      throw new Error(
        `Invalid type for value ${p}: ${typeof p}. It should be either a percentage string or a number`
      );
    });
  };

  getScrollComponent = () => {
    switch (this.props.componentType) {
      case 'FlatList':
        return FlatList;
      case 'ScrollView':
        return ScrollView;
      case 'SectionList':
        return SectionList;
      default:
        throw new Error(
          'Component type not supported: it should be one of `FlatList`, `ScrollView` or `SectionList`'
        );
    }
  };

  render() {
    const {
      renderHandle,
      snapPoints,
      initialSnapIndex,
      componentType,
      onSettle,
      animatedPosition,
      ...rest
    } = this.props;
    const AnimatedScrollableComponent = this.scrollComponent;
    const initialSnap = this.getNormalisedSnapPoints()[initialSnapIndex];

    const drawerContentSimultaneousHandlers =
      Platform.OS === 'ios'
        ? [this.scrollComponentRef, this.iOSMasterDrawer]
        : [this.scrollComponentRef];

    const initialDecelerationRate = Platform.select({
      android: initialSnapIndex === 0 ? 0.985 : 0,
      ios: 0.998,
    });

    const Content = (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          // @ts-ignore
          {
            transform: [{ translateY: this.translateY }],
          },
        ]}
      >
        <PanGestureHandler
          ref={this.drawerHandleRef}
          shouldCancelWhenOutside={false}
          simultaneousHandlers={
            Platform.OS === 'ios' ? this.iOSMasterDrawer : undefined
          }
          onGestureEvent={this.onHandleGestureEvent}
          onHandlerStateChange={this.onHandleGestureEvent}
        >
          <Animated.View>{renderHandle()}</Animated.View>
        </PanGestureHandler>
        <PanGestureHandler
          ref={this.drawerContentRef}
          simultaneousHandlers={drawerContentSimultaneousHandlers}
          shouldCancelWhenOutside={false}
          onGestureEvent={this.onDrawerGestureEvent}
          onHandlerStateChange={this.onDrawerGestureEvent}
        >
          <Animated.View style={styles.container}>
            <NativeViewGestureHandler
              ref={this.scrollComponentRef}
              waitFor={Platform.OS === 'ios' ? this.iOSMasterDrawer : undefined}
              simultaneousHandlers={this.drawerContentRef}
            >
              <AnimatedScrollableComponent
                {...rest}
                bounces={false}
                // @ts-ignore
                ref={this.contentComponentRef}
                overScrollMode="never"
                decelerationRate={initialDecelerationRate}
                onScrollBeginDrag={this.onScrollBeginDrag}
                scrollEventThrottle={1}
                contentContainerStyle={[
                  rest.contentContainerStyle,
                  { paddingBottom: this.getNormalisedSnapPoints()[0] },
                ]}
              />
            </NativeViewGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    );

    if (Platform.OS === 'android') {
      return Content;
    }

    return (
      <TapGestureHandler
        maxDurationMs={100000}
        ref={this.iOSMasterDrawer}
        maxDeltaY={initialSnap - this.getNormalisedSnapPoints()[0]}
      >
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          {Content}
        </View>
      </TapGestureHandler>
    );
  }
}

export default ScrollBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
