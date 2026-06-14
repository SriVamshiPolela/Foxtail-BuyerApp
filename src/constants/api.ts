import { Platform } from 'react-native';

// Android emulator routes to the host machine via 10.0.2.2.
// Web browsers and iOS simulator use localhost directly.
const CATALOG_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const CATALOG_API_BASE = `http://${CATALOG_HOST}:3003`;
