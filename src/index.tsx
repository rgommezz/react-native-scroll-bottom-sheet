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
  ScrollView,
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
  Easing,
  eq,
  event,
  Extrapolate,
  greaterOrEq,
  greaterThan,
  interpolate,
  multiply,
  not,
  onChange,
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
  State as GestureState,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import { Assign } from 'utility-types';

const FlatListComponentType = 'FlatList' as const;
const ScrollViewComponentType = 'ScrollView' as const;
const SectionListComponentType = 'SectionList' as const;

const { height: windowHeight } = Dimensions.get('window');
const DRAG_TOSS = 0.05;
const IOS_NORMAL_DECELERATION_RATE = 0.998;
const ANDROID_NORMAL_DECELERATION_RATE = 0.985;
const imperativeScrollOptions = {
  [FlatListComponentType]: {
    method: 'scrollToIndex',
    args: {
      index: 0,
      viewPosition: 0,
      viewOffset: 1000,
      animated: true,
    },
  },
  [ScrollViewComponentType]: {
    method: 'scrollTo',
    args: {
      x: 0,
      y: 0,
      animated: true,
    },
  },
  [SectionListComponentType]: {
    method: 'scrollToLocation',
    args: {
      itemIndex: 0,
      sectionIndex: 0,
      viewPosition: 0,
      viewOffset: 1000,
      animated: true,
    },
  },
};

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
  position: Animated.Value<number>;
  finished: Animated.Value<number>;
  frameTime: Animated.Value<number>;
}

type CommonProps = {
  /**
   * Array of numbers that indicate the different resting positions of the bottom sheet (in dp or %), starting from the top.
   * If a percentage is used, that would translate to the relative amount of the total window height.
   * For instance, if 50% is used, that'd be windowHeight * 0.5. If you wanna take into account safe areas during
   * the calculation, such as status bars and notches, please use 'topInset' prop
   */
  snapPoints: Array<string | number>;
  /**
   * Index that references the initial resting position of the drawer, starting from the top
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
   * Configuration for the timing reanimated function
   */
  animationConfig?: {
    duration: number;
    easing: Animated.EasingFunction;
  };
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
  private masterDrawer = React.createRef<TapGestureHandler>();
  private drawerHandleRef = React.createRef<PanGestureHandler>();
  private drawerContentRef = React.createRef<PanGestureHandler>();
  private scrollComponentRef = React.createRef<NativeViewGestureHandler>();

  /**
   * Reference to FlatList, ScrollView or SectionList in order to execute its imperative methods.
   */
  private contentComponentRef = React.createRef<AnimatedScrollableComponent>();
  /**
   * ScrollView prop
   */
  private onScrollBeginDrag: ScrollViewProps['onScrollBeginDrag'];
  /**
   * Pan gesture handler events for drawer handle and content
   */
  private onHandleGestureEvent: PanGestureHandlerProperties['onGestureEvent'];
  private onDrawerGestureEvent: PanGestureHandlerProperties['onGestureEvent'];
  /**
   * Main Animated Value that drives the top position of the UI drawer at any point in time
   */
  private translateY: Animated.Node<number>;
  /**
   * Animated value that keeps track of the position: 0 => closed, 1 => opened
   */
  private position: Animated.Node<number>;
  /**
   * Flag to indicate imperative snapping
   */
  private isManuallySetValue: Animated.Value<number> = new Value(0);
  /**
   * Manual snapping amount
   */
  private manualYOffset: Animated.Value<number> = new Value(0);
  /**
   * Keeps track of the current index
   */
  private nextSnapIndex: Animated.Value<number>;
  /**
   * Deceleration rate of the scroll component. This is used only on Android to
   * compensate the unexpected glide it gets sometimes.
   */
  private decelerationRate: Animated.Value<number>;
  private prevSnapIndex = -1;

  private scrollComponent: React.ComponentType<
    FlatListProps<T> | ScrollViewProps | SectionListProps<T>
  >;

  convertPercentageToDp = (str: string) =>
    (Number(str.split('%')[0]) * (windowHeight - this.props.topInset)) / 100;

  constructor(props: Props<T>) {
    super(props);
    const {
      initialSnapIndex,
      animationConfig = { duration: 250, easing: Easing.inOut(Easing.ease) },
    } = props;

    const ScrollComponent = this.getScrollComponent();
    // @ts-ignore
    this.scrollComponent = Animated.createAnimatedComponent(ScrollComponent);

    const snapPoints = this.getNormalisedSnapPoints();
    const openPosition = snapPoints[0];
    const closedPosition = snapPoints[snapPoints.length - 1];
    const initialSnap = snapPoints[initialSnapIndex];
    const tempDestSnapPoint = new Value(0);
    this.nextSnapIndex = new Value(initialSnapIndex);

    const isAndroid = new Value(Number(Platform.OS === 'android'));
    const initialDecelerationRate = Platform.select({
      android:
        props.initialSnapIndex === 0 ? ANDROID_NORMAL_DECELERATION_RATE : 0,
      ios: IOS_NORMAL_DECELERATION_RATE,
    });
    this.decelerationRate = new Value(initialDecelerationRate);

    const animationClock = new Clock();
    const animationPosition = new Value(0);
    const animationFinished = new Value(0);
    const animationFrameTime = new Value(0);

    const handleGestureState = new Value<GestureState>(-1);
    const handleOldGestureState = new Value<GestureState>(-1);
    const drawerGestureState = new Value<GestureState>(-1);
    const drawerOldGestureState = new Value<GestureState>(-1);

    const dragY = new Value(0);
    const velocityY = new Value(0);
    const lastStartScrollY = new Value(0);
    const prevTranslateYOffset = new Value(initialSnap);
    const translationY = new Value(initialSnap);
    const destSnapPoint = new Value(0);

    const lastSnap = new Value(initialSnap);
    const dragWithHandle = new Value(0);
    const scrollUpAndPullDown = new Value(0);

    this.onHandleGestureEvent = event([
      {
        nativeEvent: {
          translationY: dragY,
          oldState: handleOldGestureState,
          state: handleGestureState,
          velocityY: velocityY,
        },
      },
    ]);
    this.onDrawerGestureEvent = event([
      {
        nativeEvent: {
          translationY: dragY,
          oldState: drawerOldGestureState,
          state: drawerGestureState,
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

    const didHandleGestureBegin = eq(handleGestureState, GestureState.ACTIVE);

    const isAnimationInterrupted = and(
      or(
        eq(handleGestureState, GestureState.BEGAN),
        eq(drawerGestureState, GestureState.BEGAN)
      ),
      clockRunning(animationClock)
    );

    const didGestureFinish = or(
      and(
        eq(handleOldGestureState, GestureState.ACTIVE),
        eq(handleGestureState, GestureState.END)
      ),
      and(
        eq(drawerOldGestureState, GestureState.ACTIVE),
        eq(drawerGestureState, GestureState.END)
      )
    );

    const scrollY = [
      cond(
        or(
          didHandleGestureBegin,
          and(
            this.isManuallySetValue,
            not(eq(this.manualYOffset, snapPoints[0]))
          )
        ),
        [set(dragWithHandle, 1), 0]
      ),
      cond(
        // This is to account for a continuous scroll on the drawer from a snap point
        // Different than top, bringing the drawer to the top position, so that if we
        // change scroll direction without releasing the gesture, it doesn't pull down the drawer again
        and(
          eq(dragWithHandle, 1),
          greaterThan(snapPoints[0], sub(lastSnap, abs(dragY))),
          not(eq(lastSnap, snapPoints[0]))
        ),
        [
          set(lastSnap, snapPoints[0]),
          set(dragWithHandle, 0),
          lastStartScrollY,
        ],
        cond(eq(dragWithHandle, 1), 0, lastStartScrollY)
      ),
    ];

    const didScrollUpAndPullDown = cond(
      and(
        greaterOrEq(dragY, lastStartScrollY),
        greaterThan(lastStartScrollY, 0)
      ),
      set(scrollUpAndPullDown, 1)
    );

    const setTranslationY = cond(
      and(not(dragWithHandle), not(greaterOrEq(dragY, lastStartScrollY))),
      set(translationY, sub(dragY, lastStartScrollY)),
      set(translationY, dragY)
    );

    const extraOffset = cond(eq(scrollUpAndPullDown, 1), lastStartScrollY, 0);
    const endOffsetY = add(
      lastSnap,
      translationY,
      multiply(DRAG_TOSS, velocityY)
    );

    const calculateNextSnapPoint = (i = 0): Animated.Node<number> | number =>
      i === snapPoints.length
        ? tempDestSnapPoint
        : cond(
            greaterThan(
              abs(sub(tempDestSnapPoint, endOffsetY)),
              abs(sub(add(snapPoints[i], extraOffset), endOffsetY))
            ),
            [
              set(tempDestSnapPoint, add(snapPoints[i], extraOffset)),
              set(this.nextSnapIndex, i),
              calculateNextSnapPoint(i + 1),
            ],
            calculateNextSnapPoint(i + 1)
          );

    const runTiming = ({
      clock,
      from,
      to,
      position,
      finished,
      frameTime,
    }: TimingParams) => {
      const state = {
        finished,
        position,
        time: new Value(0),
        frameTime,
      };

      const config = {
        toValue: new Value(0),
        ...animationConfig,
      };

      return [
        cond(and(not(clockRunning(clock)), not(eq(finished, 1))), [
          // If the clock isn't running, we reset all the animation params and start the clock
          set(state.finished, 0),
          set(state.time, 0),
          set(state.position, from),
          set(state.frameTime, 0),
          set(config.toValue, to),
          startClock(clock),
        ]),
        // We run the step here that is going to update position
        timing(clock, state, config),
        cond(
          state.finished,
          [
            call([this.nextSnapIndex], ([value]) => {
              if (value !== this.prevSnapIndex) {
                this.props.onSettle?.(value);
              }
              this.prevSnapIndex = value;
            }),
            // Resetting appropriate values
            set(drawerOldGestureState, GestureState.END),
            set(handleOldGestureState, GestureState.END),
            set(prevTranslateYOffset, state.position),
            cond(eq(scrollUpAndPullDown, 1), [
              set(
                prevTranslateYOffset,
                sub(prevTranslateYOffset, lastStartScrollY)
              ),
              set(lastStartScrollY, 0),
              set(scrollUpAndPullDown, 0),
            ]),
            cond(eq(destSnapPoint, snapPoints[0]), [set(dragWithHandle, 0)]),
            set(this.isManuallySetValue, 0),
            set(this.manualYOffset, 0),
            stopClock(clock),
            prevTranslateYOffset,
          ],
          // We made the block return the updated position,
          state.position
        ),
      ];
    };

    const translateYOffset = [
      cond(isAnimationInterrupted, [
        set(prevTranslateYOffset, animationPosition),
        set(animationFinished, 1),
        // By forcing that frameTime exceeds duration, it has the effect of stopping the animation
        set(animationFrameTime, add(animationConfig.duration, 1000)),
        stopClock(animationClock),
        set(lastSnap, animationPosition),
        animationPosition,
      ]),
      cond(
        or(
          didGestureFinish,
          this.isManuallySetValue,
          clockRunning(animationClock)
        ),
        [
          didScrollUpAndPullDown,
          setTranslationY,
          set(tempDestSnapPoint, add(snapPoints[0], extraOffset)),
          cond(not(this.isManuallySetValue), set(this.nextSnapIndex, 0)),
          set(
            destSnapPoint,
            cond(
              this.isManuallySetValue,
              this.manualYOffset,
              calculateNextSnapPoint()
            )
          ),
          cond(
            and(greaterThan(dragY, lastStartScrollY), isAndroid),
            call([], () => {
              // This prevents the scroll glide from happening on Android when pulling down with inertia.
              // It's not perfect, but does the job for now
              const { method, args } = imperativeScrollOptions[
                this.props.componentType
              ];
              // @ts-ignore
              this.contentComponentRef.current?._component[method](args);
            })
          ),
          set(dragY, 0),
          set(velocityY, 0),
          set(
            lastSnap,
            sub(
              destSnapPoint,
              cond(eq(scrollUpAndPullDown, 1), lastStartScrollY, 0)
            )
          ),
          call([lastSnap], ([value]) => {
            // This is the TapGHandler trick
            // @ts-ignore
            this.masterDrawer?.current?.setNativeProps({
              maxDeltaY: value - this.getNormalisedSnapPoints()[0],
            });
          }),
          set(
            this.decelerationRate,
            cond(
              eq(isAndroid, 1),
              cond(
                eq(lastSnap, snapPoints[0]),
                ANDROID_NORMAL_DECELERATION_RATE,
                0
              ),
              IOS_NORMAL_DECELERATION_RATE
            )
          ),
          cond(this.isManuallySetValue, [set(animationFinished, 0)]),
          runTiming({
            clock: animationClock,
            from: cond(
              this.isManuallySetValue,
              prevTranslateYOffset,
              add(prevTranslateYOffset, translationY)
            ),
            to: destSnapPoint,
            position: animationPosition,
            finished: animationFinished,
            frameTime: animationFrameTime,
          }),
        ],
        [
          set(animationFrameTime, 0),
          set(animationFinished, 0),
          // @ts-ignore
          prevTranslateYOffset,
        ]
      ),
    ];

    this.translateY = interpolate(
      add(translateYOffset, dragY, multiply(scrollY, -1)),
      {
        inputRange: [openPosition, closedPosition],
        outputRange: [openPosition, closedPosition],
        extrapolate: Extrapolate.CLAMP,
      }
    );

    this.position = interpolate(this.translateY, {
      inputRange: [openPosition, closedPosition],
      outputRange: [1, 0],
      extrapolate: Extrapolate.CLAMP,
    });
  }

  private getNormalisedSnapPoints = () => {
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

  private getScrollComponent = () => {
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

  snapTo = (index: number) => {
    const snapPoints = this.getNormalisedSnapPoints();
    this.isManuallySetValue.setValue(1);
    this.manualYOffset.setValue(snapPoints[index]);
    this.nextSnapIndex.setValue(index);
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
          simultaneousHandlers={this.masterDrawer}
          onGestureEvent={this.onHandleGestureEvent}
          onHandlerStateChange={this.onHandleGestureEvent}
        >
          <Animated.View>{renderHandle()}</Animated.View>
        </PanGestureHandler>
        <PanGestureHandler
          ref={this.drawerContentRef}
          simultaneousHandlers={[this.scrollComponentRef, this.masterDrawer]}
          shouldCancelWhenOutside={false}
          onGestureEvent={this.onDrawerGestureEvent}
          onHandlerStateChange={this.onDrawerGestureEvent}
        >
          <Animated.View style={styles.container}>
            <NativeViewGestureHandler
              ref={this.scrollComponentRef}
              waitFor={this.masterDrawer}
              simultaneousHandlers={this.drawerContentRef}
            >
              <AnimatedScrollableComponent
                overScrollMode="never"
                bounces={false}
                {...rest}
                // @ts-ignore
                ref={this.contentComponentRef}
                // @ts-ignore
                decelerationRate={this.decelerationRate}
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
        {this.props.animatedPosition && (
          <Animated.Code
            exec={onChange(
              this.position,
              set(this.props.animatedPosition, this.position)
            )}
          />
        )}
      </Animated.View>
    );

    // On Android, having an intermediary view with pointerEvents="box-none", breaks the
    // waitFor logic
    if (Platform.OS === 'android') {
      return (
        <TapGestureHandler
          maxDurationMs={100000}
          ref={this.masterDrawer}
          maxDeltaY={initialSnap - this.getNormalisedSnapPoints()[0]}
          shouldCancelWhenOutside={false}
        >
          {Content}
        </TapGestureHandler>
      );
    }

    // On iOS, We need to wrap the content on a view with PointerEvents box-none
    // So that we can start scrolling automatically when reaching the top without
    // Stopping the gesture
    return (
      <TapGestureHandler
        maxDurationMs={100000}
        ref={this.masterDrawer}
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
