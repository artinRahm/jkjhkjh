import produce from "immer";
import { MESSAGES, MORE_MESSAGES, NEW_MESSAGE, MESSAGE_UPDATED, MESSAGE_DELETED, MESSAGES_BULK_DELETED } from ".";
import { useQuery, useSubscription } from "react-apollo-hooks";
import { MessageDeleted, MessagesBulkDeleted, Messages_channel, Message as MessageData, MessageUpdated, NewMessage, UpdatedMessage, NewMessageVariables, MessageUpdatedVariables, MessageDeletedVariables, MessagesBulkDeletedVariables, Messages, MessagesVariables, GuildInfo_guild_channels } from "@generated";
import { generalStore } from "@store";
import { useContext } from "react";
import { NotificationContext } from "@ui/Overlays/Notification/NotificationContext";
import Message from "@ui/Messages/Message";
import { ChannelLink, getChannel } from "@ui/shared/Channel";
import api from "@lib/embed-api";

const queryParams = new URLSearchParams(location.search)

/**
 * Fetches the messages for a channel
 */
export const useMessages = (channel: string, guild: string, thread?: string) => {
  const spawnNotif = useContext(NotificationContext)

  const query = useQuery(MESSAGES, {
    variables: { guild, channel, thread },
    fetchPolicy: 'network-only'
  });

  const ready =
    (query.data?.channel?.id === channel) ||
    false;

  const messages = ready ? query.data.channel.messageBunch.messages : [];

  generalStore.setPins(ready ? query.data.channel.messageBunch.pinnedMessages : null)

  let fullyLoaded = false

  function fetchMore(options?: {
    around?: string;
    after?: string;
    before?: string;
    limit?: number;
  }) {
    if (!channel || fullyLoaded) return;
    if (!options) {
      const [firstMessage] = messages;
      if (!firstMessage) return;

      options = { before: firstMessage.id };
    }

    return query.fetchMore({
      query: MORE_MESSAGES,
      variables: { guild, channel, thread, ...options },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (fetchMoreResult.channel.messageBunch.messages.length === 0) {
          fullyLoaded = true
          return
        }
        return produce(prev, draftState => {
          draftState.channel.messageBunch.messages = [
            ...fetchMoreResult.channel.messageBunch.messages,
            ...draftState.channel.messageBunch.messages
          ];
        })
      }
    })
  }

  const notifications = queryParams.get('notifications') === 'true'

  const channels = notifications
                && generalStore.guild
                && generalStore.settings
                && !generalStore.settings.singleChannel
                && !generalStore.settings.hideSidebar
                && !thread
    ? generalStore.guild?.channels.map(c => c.id)
    : [channel]

  useSubscription<NewMessage, NewMessageVariables>(NEW_MESSAGE, {
    variables: { channels, guild, threadId: thread },
    onSubscriptionData({ subscriptionData }) {
      query.updateQuery(prev =>
        produce(prev, (data?: { channel: Messages_channel }) => {
          const messages = data?.channel.messageBunch.messages;
          if (!messages) {
            query.refetch()
            console.warn('NEW_MESSAGE received empty initial state within subscription', subscriptionData, data);
            return;
          }

          const message = subscriptionData.data.message as MessageData

          if (generalStore.guild)
            api.emit('message', {
              channel: generalStore.guild.channels.find(c => c.id === message.channelId),
              message
            })

          let msgChannel: GuildInfo_guild_channels
          if (message.channelId !== channel && (msgChannel = getChannel(message.channelId))) {
            message.author.name += ` (#${msgChannel.name})`

            generalStore.addUnreadChannel(message.channelId)

            return spawnNotif({
              content: (
                <ChannelLink id={message.channelId}>
                  <Message message={message} isFirstMessage={true} hideTimestamp={true} />
                </ChannelLink>
              ),
              hideAfter: +queryParams.get('notificationtimeout') || 3000
            })
          }

          message.author.color = messages.find(m => m.author.id === message.author.id)?.author.color || 0xffffff
          if (!messages.find(m => m.id === message.id)) messages.push(message);

        })
      )}
  });

  useSubscription<MessageUpdated, MessageUpdatedVariables>(MESSAGE_UPDATED, {
    variables: { channels: [channel], guild, threadId: thread },
    onSubscriptionData({ subscriptionData }) {
      query.updateQuery(prev =>
        produce(prev, (data?: { channel: Messages_channel }) => {
          const messages = data?.channel.messageBunch.messages;
          if (!messages) {
            query.refetch()
            console.warn('MESSAGE_UPDATED received empty initial state within subscription', subscriptionData, data);
            return;
          }

          const message = subscriptionData.data.messageUpdate
          const index = messages.findIndex(m => m.id === message.id);

          if (index > -1) {
            const updatedProps = Object.fromEntries(Object.entries(message).filter(([_, v]) => v !== null)) as Partial<MessageData>
            if (updatedProps.author) updatedProps.author.color = messages.find(m => m.author.id === message.author?.id)?.author.color || 0xffffff
            delete updatedProps.__typename

            Object.assign(messages[index], updatedProps)
          }

          if (generalStore.guild)
            api.emit('messageUpdate', {
              channel: generalStore.guild.channels.find(c => c.id === channel),
              message: message
            })
        })
      );
    }
  });

  useSubscription<MessageDeleted, MessageDeletedVariables>(MESSAGE_DELETED, {
    variables: { channels: [channel], guild, threadId: thread },
    onSubscriptionData({ subscriptionData }) {
      query.updateQuery(prev =>
        produce(prev, (data?: { channel: Messages_channel }) => {
          const messages = data?.channel.messageBunch.messages;
          if (!messages) {
            query.refetch()
            console.warn('MESSAGE_DELETED received empty initial state within subscription', subscriptionData, data);
            return;
          }

          const { id } = subscriptionData.data.messageDelete
          const index = messages.findIndex(m => m.id === id)

          if (index > -1) messages.splice(index, 1)

          if (generalStore.guild)
            api.emit('messageDelete', {
              channel: generalStore.guild.channels.find(c => c.id === channel),
              id
            })
        })
      );
    }
  });

  useSubscription<MessagesBulkDeleted, MessagesBulkDeletedVariables>(MESSAGES_BULK_DELETED, {
    variables: { channels: [channel], guild, threadId: thread },
    onSubscriptionData({ subscriptionData }) {
      query.updateQuery(prev =>
        produce(prev, (data?: { channel: Messages_channel }) => {
          const channel = data?.channel;
          if (!channel) {
            query.refetch()
            console.warn('MESSAGES_BULK_DELETED received empty initial state within subscription', subscriptionData, data);
            return;
          }

          const { ids } = subscriptionData.data.messageDeleteBulk

          channel.messageBunch.messages = channel.messageBunch.messages.filter(
            message => !ids.includes(message.id)
          );

          if (generalStore.guild)
            api.emit('messageDeleteBulk', {
              channel: generalStore.guild.channels.find(c => c.id === channel.id),
              ids
            })
        })
      );
    }
  });

  return {
    ready,
    messages,
    fetchMore,
    error: query.error,
    // @ts-ignore
    stale: query.stale
  };
};



// WEBPACK FOOTER //
// ./src/hooks/useMessages/useMessages.tsx