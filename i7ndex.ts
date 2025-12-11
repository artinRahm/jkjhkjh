import { authStore, generalStore } from '@store'
import { Server } from '@widgetbot/embed-api'
import { store } from '@models';
import { matchPath } from 'react-router-dom';
import client from '@lib/apollo';

import SEND_MESSAGE from '@hooks/useSendMessage/SendMessage.graphql';

const queryParams = new URLSearchParams(location.search)

const api = new Server({ id: queryParams.get('api') ?? 'default' })

api.on('sendMessage', data => {
  if (!authStore.user) return

  if (typeof data === 'string') {
    const match = matchPath('/channels/:guild/:channel', location.pathname)

    if (match) {
      client.mutate({
        mutation: SEND_MESSAGE,
        variables: {
          channel: match.params.channel,
          content: data
        }
      })
    }
  } else if (
    data instanceof Object &&
    typeof data.channel === 'string' &&
    typeof data.message === 'string'
  ) {
    const { channel, message } = data
    if (generalStore.guild?.channels.some(c => c.id === channel)) {
      client.mutate({
        mutation: SEND_MESSAGE,
        variables: {
          channel,
          content: message
        }
      })
    }
  }
})

api.on('login', () => {
  if (authStore.user) return

  generalStore.settings?.guestMode ? generalStore.toggleMenu(true) : store.modal.openDiscordLogin()
})

api.on('logout', () => {
  authStore.logout()
})

api.on('setToken', token => {
  authStore.setToken(token);
});

api.emit('ready');

export default api



// WEBPACK FOOTER //
// ./src/lib/embed-api/index.ts