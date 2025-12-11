import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory'
import { persistCache } from 'apollo-cache-persist'
import localForage from 'localforage'

import cacheRedirects from './cacheRedirects'
import dataIdFromObject from './dataIdFromObject'

const introspectionQueryResultData = require('../codegen/fragmentTypes.json')
const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
})

const cache = new InMemoryCache({
  fragmentMatcher,
  cacheRedirects,
  dataIdFromObject
})

let ls: Storage
try {
  ls = localStorage
} catch (e) {}

export const cacheLoaded =
  ls ? persistCache({
    cache,
    storage: localForage as any
  }) : Promise.resolve()

export default cache;



// WEBPACK FOOTER //
// ./src/lib/apollo/cache/index.ts