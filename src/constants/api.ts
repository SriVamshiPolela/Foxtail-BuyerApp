import { Platform } from 'react-native';

// Android emulator routes to the host machine via 10.0.2.2.
// Web browsers and iOS simulator use localhost directly.
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const CATALOG_API_BASE  = `http://${HOST}:3003`;
export const AUTH_API_BASE     = `http://${HOST}:3001`;
export const USER_API_BASE     = `http://${HOST}:3002`;
export const ORDER_API_BASE    = `http://${HOST}:3004`;
export const PAYMENT_API_BASE  = `http://${HOST}:3005`;
