module.exports = {
  components: './components/index',
  outputPath: './dist/playroom',

  // Optional:
  title: 'My Awesome Library',
  // themes: './src/themes',
  // frameComponent: './playroom/FrameComponent.js',
  widths: [320, 375, 768, 1024],
  exampleCode: `
    <Textarea>
      Hello World!
    </Textarea>
  `,
  // webpackConfig: () => ({
  //   // Custom webpack config goes here...
  // })
};
