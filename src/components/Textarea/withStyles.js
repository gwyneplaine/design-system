import React from 'react'
import Textarea from './src';
import StylesContext from '../../StylesContext';
export default (props) => (
  <StylesContext.Consumer>
    {(styles) => console.log('StylesContext.Consumer', styles) || <Textarea {...props} styles={styles}/>}
  </StylesContext.Consumer>
);
