const path = require('path');
require ('dotenv').config({
    path: path.resolve(__dirname, '.env')
});

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const APP_URL = process.env.EXPO_PUBLIC_URL;
const RIDES_URL = process.env.EXPO_PUBLIC_RIDES_URL;


export default ({ config }) => {
  return {
    ...config,
    extra: {
      EXPO_PUBLIC_BASE_URL: BASE_URL,
      EXPO_PUBLIC_URL: APP_URL,
      EXPO_PUBLIC_RIDES_URL: RIDES_URL,
    }
  };
};