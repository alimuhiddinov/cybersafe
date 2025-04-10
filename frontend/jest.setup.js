// jest.setup.js
import '@testing-library/jest-dom';
import 'jest-localstorage-mock';
import { TextEncoder, TextDecoder } from 'util';
import { server } from './src/mocks/server';

// Initialize MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Next.js image components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    beforePopState: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set up environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api';

// Clear all mocks between each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: new Map(),
  })
);

// Mock local storage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.alert and window.confirm
window.alert = jest.fn();
window.confirm = jest.fn(() => true);

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});
