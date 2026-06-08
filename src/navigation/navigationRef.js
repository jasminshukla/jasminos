import { createNavigationContainerRef } from '@react-navigation/native';

// A ref to the root NavigationContainer so non-screen code (e.g. the share-intent
// handler) can navigate without being inside a screen component.
export const navigationRef = createNavigationContainerRef();

// Navigate as soon as the navigator is mounted. If it isn't ready yet (cold start
// from a share intent), poll briefly until it is, then navigate.
export function navigateWhenReady(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
    return;
  }
  const started = Date.now();
  const timer = setInterval(() => {
    if (navigationRef.isReady()) {
      clearInterval(timer);
      navigationRef.navigate(name, params);
    } else if (Date.now() - started > 8000) {
      // Give up after 8s so we never leak the interval.
      clearInterval(timer);
    }
  }, 100);
}
