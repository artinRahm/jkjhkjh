import { useMutation } from 'react-apollo-hooks'
import SEND_MESSAGE from './SendMessage.graphql'
import { MESSAGES } from '../useMessages'
import { useRouter } from '@hooks'
import { Messages, MessagesVariables, SendMessage, SendMessageVariables } from '@generated';
import { addNotification } from "notify";
import { MessageType } from '@generated/globalTypes';
import { Util } from '@lib/Util';
import { authStore, generalStore } from '@store';

import api from '@lib/embed-api';

export const useSendMessage = (thread?: string) => {
  const { guild, channel } = useRouter()
  const sendMessage = useMutation<SendMessage, SendMessageVariables>(SEND_MESSAGE);

  return async (content: string, fileName?: string, fileData?: string, fileAlt?: string) => {
    await sendMessage({
      variables: { channel, content, fileName, fileData, fileAlt, thread },
      optimisticResponse: {
        __typename: 'Mutation',
        sendMessage: {
          __typename: 'Message',
          id: Util.generateSnowflake(),
          channelId: channel,
          content: content,
          type: MessageType.Default,
          flags: 1 << 4, // reusing flag for optimistic messages
          createdAt: +new Date(),
          editedAt: null,
          isGuest: true,
          author: {
            __typename: 'User',
            avatarUrl: 'avatarUrl' in authStore.user && authStore.user.avatarUrl || 'avatar' in authStore.user && Util.craftAvatarUrl(authStore.user._id, authStore.user.avatar),
            bot: true,
            color: 0,
            discrim: '0000',
            id: '_id' in authStore.user ? authStore.user._id : Util.generateSnowflake(),
            flags: 0,
            name: authStore.user.username,
            roles: [],
            system: false,
            isWebhook: true
          },
          reactions: [],
          attachments: [],
          stickers: [],
          messageReference: null,
          referencedMessage: null,
          embeds: [],
          mentions: [],
          interaction: null,
          thread: null,
        }
      } as SendMessage, update: (store, { data: { sendMessage: newMessage } }) => {
        const data = store.readQuery<Messages>({ query: MESSAGES, variables: { guild, channel, thread } })

        newMessage.isGuest = true

        if (!data.channel.messageBunch.messages.find(m => m.id === newMessage.id))
          data.channel.messageBunch.messages.push(newMessage)

        if (!(newMessage.flags & 1 << 4)) {
          // trims spaces so Discord's normalization doesn't break it
          const optimisticIndex = data.channel.messageBunch.messages.findIndex(m => m.content.replace(/ /g, '') === newMessage.content.replace(/ /g, '') && m.flags & 1 << 4)
          if (optimisticIndex > -1) data.channel.messageBunch.messages.splice(optimisticIndex, 1)
        }

        store.writeQuery<Messages, MessagesVariables>({query: MESSAGES, variables: { guild, channel, thread }, data})
      }
    }).catch(error => addNotification({
      level: 'error',
      title: 'Error sending message',
      message: error.toString().replace('GraphQL error: ', ''),
      autoDismiss: 0
    }))

    if (generalStore.guild)
      api.emit('sentMessage', {
        channel: generalStore.guild.channels.find(c => c.id === channel),
        content,
        fileName,
        fileData,
        fileAlt,
        thread
      })
  }
}



// WEBPACK FOOTER //
// ./src/hooks/useSendMessage/useSendMessage.ts