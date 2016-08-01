import devConfig from './development';
import prodConfig from './production';

const config =
  process.env.NODE_ENV === 'development' ?
  devConfig :
  prodConfig;

export default config;
