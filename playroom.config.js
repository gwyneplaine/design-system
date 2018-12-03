module.exports = {
  components: './components/index',
  outputPath: './dist/playroom',

  // Optional:
  title: 'My Awesome Library',
  // themes: './src/themes',
  frameComponent: './FrameComponent.js',
  widths: [320, 375, 768, 1024],
  exampleCode: `
    <Textarea>
      Hello World!
    </Textarea>
  `,
  webpackConfig: () => ({
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-flow'],
              plugins: ['@babel/plugin-proposal-class-properties']
            }
          }
        }
      ],
    }
  })
};
