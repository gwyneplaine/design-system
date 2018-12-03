// @flow
/** @jsx jsx */
import { Component } from 'react';
import { css, jsx } from '@emotion/core';
type TextAreaProps = {
  resize: 'smart' | 'auto' | 'vertical' | 'horizontal' | 'none',
  isDisabled?: boolean,
  isReadOnly?: boolean,
  isRequired?: boolean,
  isMonospaced?: boolean,
  isInvalid?: boolean,
}

type State = {
  isFocused: boolean,
  height: string,
}
type TextareaCSSState = {
  resize: 'smart' | 'auto' | 'vertical' | 'horizontal' | 'none',
  height: string,
  height: boolean,
  isDisabled: boolean,
  isReadOnly: boolean,
  isRequired: boolean,
  isMonospaced: boolean,
  isInvalid: boolean,
  isFocused: boolean,
}

const textareaCSS = ({ resize, height, ...props }: TextareaCSSState) => ({
  height,
  resize: (resize === 'smart' || resize === 'none') ? "none" : resize
});

export default class TextArea extends Component<TextAreaProps, State> {
  state = {
    isFocused: false,
    height: '100%'
  }

  getTextAreaRef = (ref: HTMLTextAreaElement | null) => {
    this.textareaElement = ref;
    if (this.props.forwardedRef) {
      this.props.forwardedRef(ref);
    }
  }

  handleOnChange = (event: SyntheticInputEvent<HTMLTextAreaElement>) => {
    const { onChange } = this.props;
    if (this.props.resize === 'smart') {
      this.setState({ height: 'auto' }, () => {
        if (this.props.resize === 'smart' && this.textareaElement) {
          this.setState({
            height: `${this.textareaElement.scrollHeight}px`
          });
        }
      })
    }
    if (onChange) {
      onChange(event);
    }
  }

  segmentProps = () => {
    const {
      resize,
      isDisabled,
      isRequired,
      isFocused,
      isReadOnly,
      isMonospaced,
      isInvalid,
      ...cleanProps
    } = this.props;

    delete cleanProps.forwardedRef;

    const cssProps = {
      resize,
      isDisabled,
      isRequired,
      isFocused,
      isReadOnly,
      isMonospaced,
      isInvalid,
    }

    return {
      cleanProps,
      cssProps,
    }
  }

  render () {
    const { forwardedRef, ...props } = this.props;
    const { cssProps, cleanProps } = this.segmentProps()
    const { height } = this.state;
    
    return (
      <textarea
        {...cleanProps}
        onChange={this.handleOnChange}
        ref={this.getTextAreaRef}
        css={textareaCSS({ ...cssProps, height })}
      />
    )
  }
}

// export default ({ children }) => <div>{ children }</div>
