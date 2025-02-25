module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@app': './src/app',
            '@features': './src/features',
            '@shared': './src/shared',
            '@navigation': './src/navigation',
            '@theme': './src/theme',
            '@context': './src/context',
            '@services': './src/services',
            '@types': './src/types',
            '@constants': './src/constants'
          }
        }
      ]
    ]
  };
};