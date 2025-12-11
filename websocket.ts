import { WebSocketLink } from 'apollo-link-ws'
import {WS_URL} from "@lib/env";

let ls: Storage
try {
  ls = localStorage
} catch (e) {}

const queryParams = new URLSearchParams(location.search)

const wsLink = new WebSocketLink({
  uri: WS_URL,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: ls?.getItem('token') || '',
      settingsGroup: queryParams.get('settings-group') || ''
    }
  }
});

export default wsLink



// WEBPACK FOOTER //
// ./src/lib/apollo/link/websocket.ts