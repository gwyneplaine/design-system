export default {
  textarea: (styles, { invalid }) => ({
    ...styles,
    border: `1px solid ${ invalid ? 'red' : 'green' }`,
  })
}
