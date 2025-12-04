// babel.config.js

module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      // Αυτό κάνει όλη τη δουλειά για Expo/TypeScript/JSX
      'babel-preset-expo', 
    ],
    plugins: [
      // Αν χρησιμοποιείς animation/navigation/Stack (όπως εσύ), αυτό είναι απαραίτητο:
      'react-native-reanimated/plugin',
    ],
  };
};