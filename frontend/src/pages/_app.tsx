import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store';
import '../styles/globals.css';
import ErrorBoundary from '../components/ErrorBoundary';
import AuthWrapper from '../components/AuthWrapper';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AuthWrapper>
          <Component {...pageProps} />
        </AuthWrapper>
      </ErrorBoundary>
    </Provider>
  );
}
