// @flow
/** @jsx jsx */
import { Component } from 'react';
import { css, jsx } from '@emotion/core';

type TextAreaProps = {
  resize: 'smart' | 'auto' | 'vertical' | 'horizontal' | 'none',
  disabled: boolean,
  readOnly: boolean,
  required: boolean,
  monospaced: boolean,
  invalid: boolean,
}

type State = {
  focused: boolean,
  height: string,
}

type StylesObject = {
  [string]: any
};

type TextareaCSSState = {
  resize: 'smart' | 'auto' | 'vertical' | 'horizontal' | 'none',
  height: string,
  disabled: boolean,
  readOnly: boolean,
  required: boolean,
  monospaced: boolean,
  invalid: boolean,
  focused: boolean,
  styles: (styles, state) => StylesObject;
}

// const textareaWrapperCSS = ({ disabled, resize }) => ({
//   border: '1px solid',
//   position: 'relative;',
//   boxSizing: 'border-box;',
//   overflow: 'auto;',
//   wordWrap: 'break-word;',
//   ...(disabled ? { cursor: 'not-allowed' } : null ),
//   fontSize: 'inherit',
//   resize: (resize === 'smart' || resize === 'none') ? "none" : resize,
// });

const textareaCSS = ({ resize, height, ...state }: TextareaCSSState) => ({
  display: 'block',
  background: 'transparent',
  margin: 0,
  resize: 'none',
  boxSizing: 'border-box',
  cursor: 'inherit',
  border: 0,
  width: '100%',
  fontSize: 'inherit',
  outline: 'none',
  overflow: 'auto',
  '&[disabled]': {
    '-webkit-text-fill-color': 'unset',
    '-webkit-opacity': 1,
  },
  '&::-ms-clear': {
    display: 'none;'
  },

  '&:invalid': {
    boxShadow: 'none;'
  },
  height,
});

const defaultStyles = {
  textarea: textareaCSS,
}

export default class TextArea extends Component<TextAreaProps, State> {
  static defaultProps = {
    resize: 'smart',
    disabled: false,
    readOnly: false,
    required: false,
    monospaced: false,
    invalid: false,
    focused: false,
  }
  state = {
    focused: false,
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

  getStyles = (key, state) => {
    const styles = defaultStyles[key](state);
    const custom = this.props.styles[key];
    return custom ? custom(styles, state) : styles;
  };

  segmentProps = () => {
    const {
      resize,
      disabled,
      required,
      focused,
      readOnly,
      monospaced,
      invalid,
    } = this.props;

    const cssProps = {
      resize,
      disabled,
      required,
      focused,
      readOnly,
      monospaced,
      invalid
    };

    const cleanProps = { ...this.props };
    delete cleanProps.forwardedRef;
    delete cleanProps.resize;
    delete cleanProps.styles;

    return {
      cleanProps,
      cssProps,
    }
  }

  render () {
    const { forwardedRef, ...props } = this.props;
    const { cssProps, cleanProps } = this.segmentProps();
    const { height } = this.state;

    return (
      <textarea
        {...cleanProps}
        onChange={this.handleOnChange}
        ref={this.getTextAreaRef}
        css={this.getStyles('textarea', { ...cssProps, height })}
      />
    )
  }
}
