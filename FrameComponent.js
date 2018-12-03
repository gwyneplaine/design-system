import React from 'react';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import weakMemoize from '@emotion/weak-memoize';

let memoizedCreateCacheWithContainer = weakMemoize(container => {
  let newCache = createCache({ container });
  return newCache;
})
export default ({ children, frameWindow }) => (
  <CacheProvider value={memoizedCreateCacheWithContainer(frameWindow.document.head)} >
    {children}
  </CacheProvider>
);
