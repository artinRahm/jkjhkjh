import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context';

import cache from './cache'
import link from './link'

const queryParams = new URLSearchParams(location.search)

function getGuildId() {
  // ['channels', 'guildId', 'channelId']
  const split = location.pathname.split('/').filter(Boolean);

  if (split.length >= 2) {
      return split[1];
  }
}

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  let token: string
  try {
    token = window.localStorage.getItem('token');
  } catch (e) {}

  const guildId = getGuildId();

  headers ??= {}

  // return the headers to the context so httpLink can read them
  if (token) headers.authorization = token
  if (guildId) headers['X-Guild-ID'] = guildId;
  if (queryParams.has('settings-group')) headers['X-Settings-Group'] = queryParams.get('settings-group')

  return { headers }
});

const client = new ApolloClient({
  link: authLink.concat(link),
  cache,
  connectToDevTools: true
});

export default client



// WEBPACK FOOTER //
// ./src/lib/apollo/index.ts