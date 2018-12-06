/** @jsx jsx */
import { Component, forwardRef } from 'react';
import flushable from 'flushable';
import { jsx } from '@emotion/core';
import { Manager, Popper, Reference } from '@atlaskit/popper';
import Animation from './Animation';
import Portal from '@atlaskit/portal';

type Props = {
  /** A single element, either Component or DOM node */
  children: ({ ref: ElementRef<*> }) => Node,
  /** The content of the tooltip */
  content: Node,
  /** Extend `TooltipPrimitive` to create your own tooptip and pass it as component */
  components: {
    Container: ComponentType<{ innerRef: HTMLElement => void }>,
  },
  /** Time in milliseconds to wait before showing and hiding the tooltip. Defaults to 300. */
  delay: number,
  /**
    Hide the tooltip when the click event is triggered. This should be
    used when tooltip should be hiden if `onClick` react synthetic event
    is triggered, which happens after `onMouseDown` event
  */
  hideTooltipOnClick?: boolean,
  /**
    Hide the tooltip when the mousedown event is triggered. This should be
    used when tooltip should be hiden if `onMouseDown` react synthetic event
    is triggered, which happens before `onClick` event
  */
  hideTooltipOnMouseDown?: boolean,
  /**
    Where the tooltip should appear relative to the mouse. Only used when the
    `position` prop is set to 'mouse'
  */
  mousePosition: PositionTypeBase,
  /**
    Function to be called when the tooltip will be shown. It is called when the
    tooltip begins to animate in.
  */
  onShow?: () => void,
  /**
    Function to be called when the tooltip will be hidden. It is called after the
    delay, when the tooltip begins to animate out.
  */
  onHide?: () => void,
  /**
    Where the tooltip should appear relative to its target. If set to 'mouse',
    tooltip will display next to the mouse instead.
  */
  position: PositionType,
  /**
    Replace the wrapping element. This accepts the name of a html tag which will
    be used to wrap the element.
  */
  tag: string,
  /** Show only one line of text, and truncate when too long */
  truncate?: boolean,
};

const truncateStyles = (truncate) => ( truncate ? {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} : null);

const containerCSS = ({ truncate }) => ({
  position: 'fixed',
  pointerEvents: 'none;',
  boxSizing: 'border-box;',
  fontSize: 'inherit',
  left: 0,
  top: 0,
  /* Edge does not support overflow-wrap */
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  ...(truncateStyles(truncate))
});

const defaultStyles = {
  container: containerCSS,
}

const TooltipContainer = forwardRef(({ children, getStyles, truncate, positioningStyles, ...props }, ref) => (
  <div ref={ref} css={getStyles('container', { truncate, positioningStyles })} {...props}>
    { children }
  </div>
))

function getMousePosition(mouseCoordinates) {
  const safeMouse = mouseCoordinates || { top: 0, left: 0 };
  const getBoundingClientRect = () => {
    return {
      top: safeMouse.top,
      left: safeMouse.left,
      bottom: safeMouse.top,
      right: safeMouse.left,
      width: 0,
      height: 0,
    };
  };
  return {
    getBoundingClientRect,
    clientWidth: 0,
    clientHeight: 0,
  };
}

let pendingHide;

const showTooltip = (fn: boolean => void, defaultDelay: number) => {
  const isHidePending = pendingHide && pendingHide.pending();
  if (isHidePending) {
    pendingHide.flush();
  }
  const pendingShow = flushable(
    () => fn(isHidePending),
    isHidePending ? 0 : defaultDelay,
  );
  return pendingShow.cancel;
};

const hideTooltip = (fn: boolean => void, defaultDelay: number) => {
  pendingHide = flushable(flushed => fn(flushed), defaultDelay);
  return pendingHide.cancel;
};

export default class Tooltip extends Component {
  static defaultProps = {
    components: {
      Container: TooltipContainer,
    },
    tag: 'div',
    styles: {},
    hideTooltipOnClick: false,
  }
  wrapperRef: HTMLElement | null;
  fakeMouseElement;
  cancelPendingSetState = () => {}; // set in mouseover/mouseout handlers
  state = {
    isVisible: false,
    renderToolTip: false,
    immediatelyShow: false,
    immediatelyHide: false,
  }
  componentWillUnmount() {
    this.cancelPendingSetState();
  }
  componentDidUpdate(prevProps: Props, prevState: State) {
    const scrollOptions = { capture: true, passive: true };
    if (!prevState.isVisible && this.state.isVisible) {
      if (this.props.onShow) this.props.onShow();
      window.addEventListener('scroll', this.onWindowScroll, scrollOptions)
    } else if (prevState.isVisible && !this.state.isVisible) {
      if (this.props.onHide) this.props.onHide();
      window.removeEventListener('scroll', this.onWindowScroll, scrollOptions);
    }
  }

  getStyles = (key, state) => {
    const styles = defaultStyles[key](state);
    const custom = this.props.styles[key];
    return custom ? custom(styles, state) : state;
  }

  onWindowScroll = () => {
    if (this.state.isVisible) {
      this.cancelPendingSetState();
      this.setstate({
        isVisible: false,
        immediatelyHide: true
      });
    }
  }
  onClick = () => {
    if (this.props.hideTooltipOnClick) {
      this.cancelPendingSetState();
      this.setState({ isVisible: false, immediatelyHide: true });
    }
  }

  onMouseDown = () => {
    if (this.props.hideTooltipOnMouseDown) {
      this.cancelPendingSetState();
      this.setState({ isVisible: false, immediatelyHide: true });
    }
  }

  onMouseOver = (event) => {
    if (event.target === this.wrapperRef) return;
    // In the case where a tooltip is newly rendered but immediately becomes hovered,
    // we need to set the coordinates in the mouseOver event.
    if (!this.fakeMouseElement)
    this.fakeMouseElement = getMousePosition({
      left: event.clientX,
      top: event.clientY,
    });
    this.cancelPendingSetState();
    if (Boolean(this.props.content) && !this.state.renderTooltip) {
      this.cancelPendingSetState = showTooltip(immediatelyShow => {
        this.setState({
          isVisible: true,
          renderTooltip: true,
          immediatelyShow,
        });
      }, this.props.delay);
    }
  }

  onMouseLeave = (e: SyntheticMouseEvent<>) => {
    console.log('onMouseLeave');
    if (e.target === this.wrapperRef) return;
    this.cancelPendingSetState();
    if (this.state.renderTooltip) {
      this.cancelPendingSetState = hideTooltip(immediatelyHide => {
        this.setState({ isVisible: false, immediatelyHide });
      }, this.props.delay);
    }
  };

  render () {
    const {
      children,
      content,
      position,
      mousePosition,
      truncate,
      container: TooltipContainer,
      tag: TargetContainer,
    } = this.props;

    const {
      isVisible,
      renderTooltip,
      immediatelyShow,
      immediatelyHide,
    } = this.state;

    return (
      <Manager>
        <TargetContainer
          ref={wrapperRef => { this.wrapperRef = wrapperRef; }}
          onClick={this.onClick}
          onMouseDown={this.onMouseDown}
          onMouseOver={this.onMouseOver}
          onMouseLeave={this.onMouseLeave}
          onMouseMove={this.onMouseMove}
        >
          <Reference>
            {({ ref }) =>
              this.props.children({
                ref,
              })
            }
          </Reference>
        </TargetContainer>
        {renderTooltip ? (
          <Popper
            referenceElement={position === 'mouse' ? this.fakeMouseElement : undefined }
            placement={position === 'mouse' ? mousePosition : position}
          >
            {({ ref, style, placement }) => (
              <Animation
                immediatelyShow={immediatelyShow}
                immediatelyHide={immediatelyHide}
                onExited={() => this.setState({ renderTooltip: false })}
                in={isVisible}
              >
                {getAnimationStyles => (
                  <Portal zIndex={120}>
                    <div ref={ref} css={{
                      ...getAnimationStyles(placement),
                      ...style,
                      border: '1px solid red',
                    }}>
                        {content}
                    </div>
                  </Portal>
                )}
              </Animation>
            )}
          </Popper>
        ): null}
      </Manager>
    );
  }
}
