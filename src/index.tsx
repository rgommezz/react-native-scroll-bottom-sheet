import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  FlatListProps,
  ScrollViewProps,
  SectionList,
  SectionListProps,
  StyleSheet,
} from 'react-native';
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerProperties,
  PanGestureHandlerStateChangeEvent,
  ScrollView,
  State,
} from 'react-native-gesture-handler';
import { Assign } from 'utility-types';

const FlatListComponentType = 'FlatList' as const;
const ScrollViewComponentType = 'ScrollView' as const;
const SectionListComponentType = 'SectionList' as const;

const { height: windowHeight } = Dimensions.get('window');

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
  animatedPosition?: Animated.Value;
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

  /**
   * Reference to FlatList, ScrollView or SectionList in order to execute its imperative methods.
   */
  private contentComponentRef = React.createRef<AnimatedScrollableComponent>();
  /**
   * Callback executed whenever we start scrolling on the Scrollable component
   */
  private onScrollBeginDrag: ScrollViewProps['onScrollBeginDrag'];
  /**
   * Callback executed per frame, as long as the pan handler is active (like when we are dragging)
   */
  private onGestureEvent: PanGestureHandlerProperties['onGestureEvent'];
  /**
   * Animated value which reflects the amount we drag our finger vertically over the screen.
   * Its range is determined by the screen height, being [-SCREEN_HEIGHT, +SCREEN_HEIGHT]
   * Negative values indicate dragging the finger up, positive values down
   */
  private dragY = new Animated.Value(0);
  /**
   * Animated value that acts as an accumulator on the Y axis.
   */
  private translateYOffset: Animated.Value;
  /**
   * Animated value that keeps track of how far have we scrolled on the FlatList.
   * This is key to determine when should be able to pull down the drawer, which is exactly
   * once we reach the top of the FlatList
   */
  private lastStartScrollY = new Animated.Value(0);
  /**
   * Main Animated Value that drives the top position of the UI drawer at any point in time
   */
  private translateY: Animated.AnimatedInterpolation;
  /**
   * The underlying numeric value of lastStartScrollY
   */
  private lastStartScrollYValue = 0;
  /**
   * Last snapping Y position
   */
  private lastSnap: number;
  /**
   * Boolean that indicates whether we are pulling down/up the drawer with the handle.
   */
  private isDragWithHandle: boolean = false;

  private didSnapToDifferentThanTopWithHandle: boolean = false;

  /**
   * Animated value used to be able to pull down the drawer with the handle
   * when the list is not scrolled to the top
   */
  private lastEndScrollY: Animated.Value = new Animated.Value(0);

  /**
   * Boolean that indicates a continuous gesture that did scroll up and pull down the drawer at the same time
   */
  private didScrollUpAndPullDown = false;

  private scrollComponent: React.ComponentType<
    FlatListProps<T> | ScrollViewProps | SectionListProps<T>
  >;

  convertPercentageToDp = (str: string) =>
    (Number(str.split('%')[0]) * (windowHeight - this.props.topInset)) / 100;

  constructor(props: Props<T>) {
    super(props);
    const ScrollComponent = this.getScrollComponent();
    this.scrollComponent = Animated.createAnimatedComponent(
      // @ts-ignore
      ScrollComponent
    );
    const snapPoints = this.getNormalisedSnapPoints();
    const openPosition = snapPoints[0];
    const closedPosition = snapPoints[snapPoints.length - 1];
    this.lastSnap = snapPoints[props.initialSnapIndex];

    this.translateYOffset = new Animated.Value(this.lastSnap);
    this.onGestureEvent = Animated.event(
      [{ nativeEvent: { translationY: this.dragY } }],
      { useNativeDriver: true }
    );
    this.onScrollBeginDrag = Animated.event(
      [{ nativeEvent: { contentOffset: { y: this.lastStartScrollY } } }],
      { useNativeDriver: true }
    );

    this.lastStartScrollY.addListener(({ value }) => {
      this.lastStartScrollYValue = value;
    });

    this.translateY = Animated.add(
      Animated.add(this.translateYOffset, this.lastEndScrollY),
      Animated.add(
        this.dragY,
        Animated.multiply(new Animated.Value(-1), this.lastStartScrollY)
      )
    ).interpolate({
      inputRange: [openPosition, closedPosition],
      outputRange: [openPosition, closedPosition],
      extrapolate: 'clamp',
    });

    if (this.props.animatedPosition) {
      // We are using timing() and a duration of 0 for rigid tracking
      Animated.timing(this.props.animatedPosition, {
        // @ts-ignore
        toValue: this.translateY.interpolate({
          inputRange: [openPosition, closedPosition],
          outputRange: [1, 0],
        }),
        duration: 0,
      }).start();
    }
  }

  componentWillUnmount() {
    this.lastStartScrollY.removeAllListeners();
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

  onHeaderHandlerStateChange: PanGestureHandlerProperties['onHandlerStateChange'] = ({
    nativeEvent,
  }) => {
    if (nativeEvent.oldState === State.BEGAN) {
      this.isDragWithHandle = true;
      // If we pull down the drawer with the handle, we set this value to compensate the amount of scroll on the FlatList
      this.lastEndScrollY.setValue(this.lastStartScrollYValue);
    }
    this.onHandlerStateChange({ nativeEvent }, true);
  };

  getSnapPoint = (
    velocityY: number,
    translationY: number,
    didScrollUpAndPullDown: boolean = false
  ) => {
    const snapPoints = this.getNormalisedSnapPoints();
    const extraOffset = didScrollUpAndPullDown ? this.lastStartScrollYValue : 0;
    const dragToss = 0.05;
    const endOffsetY = this.lastSnap + translationY + dragToss * velocityY;

    let destSnapPoint = snapPoints[0] + extraOffset;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < snapPoints.length; i++) {
      const snapPoint = snapPoints[i] + extraOffset;
      const distFromSnap = Math.abs(snapPoint - endOffsetY);
      if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
        destSnapPoint = snapPoint;
      }
    }

    return destSnapPoint;
  };

  handleMomentumScrollEnd: ScrollViewProps['onMomentumScrollEnd'] = ({
    nativeEvent: {
      contentOffset: { y },
    },
  }) => {
    // Updating the position of last scroll after the momentum ends.
    if (!this.didScrollUpAndPullDown) {
      this.lastStartScrollY.setValue(y);
      this.lastStartScrollYValue = y;
    }
  };

  resetValues = (
    translationY: number,
    destSnapPoint: number,
    didScrollUpAndPullDown: boolean
  ) => {
    this.translateYOffset.extractOffset();
    this.translateYOffset.setValue(translationY);
    this.translateYOffset.flattenOffset();
    this.dragY.setValue(0);
    this.lastSnap =
      destSnapPoint - (didScrollUpAndPullDown ? this.lastStartScrollYValue : 0);
  };

  onHandlerStateChange = (
    { nativeEvent }: PanGestureHandlerStateChangeEvent,
    isWithHandle: boolean = false
  ) => {
    const snapPoints = this.getNormalisedSnapPoints();
    if (
      nativeEvent.oldState === State.ACTIVE &&
      nativeEvent.state === State.END
    ) {
      // Translation of the pan gesture along Y axis accumulated over the time of the gesture.
      let { velocityY, translationY } = nativeEvent;
      if (
        !isWithHandle &&
        !this.didSnapToDifferentThanTopWithHandle &&
        !(translationY >= this.lastStartScrollYValue)
      ) {
        // We offset it with the position of the scroll
        translationY -= this.lastStartScrollYValue;
      } else if (
        translationY >= this.lastStartScrollYValue &&
        this.lastStartScrollYValue > 0
      ) {
        this.didScrollUpAndPullDown = true;
      }

      let destSnapPoint = this.getSnapPoint(
        velocityY,
        translationY,
        this.didScrollUpAndPullDown
      );

      this.resetValues(
        translationY,
        destSnapPoint,
        this.didScrollUpAndPullDown
      );

      Animated.timing(this.translateYOffset, {
        toValue: destSnapPoint,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        // @ts-ignore
        this.contentComponentRef.current?._component?.setNativeProps({
          decelerationRate: this.lastSnap === snapPoints[0] ? 0.985 : 0,
        });
        if (this.didScrollUpAndPullDown) {
          // Compensate values between startScroll (set it to 0) and restore the final amount from translateYOffset;
          this.translateYOffset.extractOffset();
          this.translateYOffset.setValue(-this.lastStartScrollYValue);
          this.translateYOffset.flattenOffset();
          this.lastStartScrollY.setValue(0);
          this.lastStartScrollYValue = 0;
          this.didScrollUpAndPullDown = false;
        }

        if (
          this.isDragWithHandle &&
          destSnapPoint !== this.props.snapPoints[0]
        ) {
          // We have snapped to any snapping point different than top with the handle
          this.didSnapToDifferentThanTopWithHandle = true;
        } else if (
          this.didSnapToDifferentThanTopWithHandle &&
          destSnapPoint === snapPoints[0]
        ) {
          // We have come back to the top snapping point and the list is not scrolled to the top
          this.lastEndScrollY.setValue(0);
          this.didSnapToDifferentThanTopWithHandle = false;
          this.isDragWithHandle = false;
        }

        const snapIndex = snapPoints.findIndex(p => p === destSnapPoint);
        if (typeof this.props.onSettle === 'function') {
          this.props.onSettle(snapIndex);
        }
      });
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

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateY: this.translateY }],
          },
        ]}
      >
        <PanGestureHandler
          ref={this.drawerHandleRef}
          shouldCancelWhenOutside={false}
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onHeaderHandlerStateChange}
        >
          <Animated.View>{renderHandle()}</Animated.View>
        </PanGestureHandler>
        <PanGestureHandler
          ref={this.drawerContentRef}
          simultaneousHandlers={[this.scrollComponentRef]}
          shouldCancelWhenOutside={false}
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onHandlerStateChange}
        >
          <Animated.View style={styles.container}>
            <NativeViewGestureHandler
              ref={this.scrollComponentRef}
              simultaneousHandlers={this.drawerContentRef}
            >
              <AnimatedScrollableComponent
                bounces={false}
                // @ts-ignore
                ref={this.contentComponentRef}
                overScrollMode="never"
                decelerationRate={initialSnapIndex === 0 ? 0.985 : 0}
                onScrollBeginDrag={this.onScrollBeginDrag}
                onMomentumScrollEnd={this.handleMomentumScrollEnd}
                scrollEventThrottle={1}
                {...rest}
              />
            </NativeViewGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    );
  }
}

export default ScrollBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
