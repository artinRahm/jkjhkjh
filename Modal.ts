import { types } from 'mobx-state-tree'

export const Modal = types
  .model('Modal', {
    type: types.maybeNull(types.string),
    data: types.maybeNull(types.string),
    originalUrl: types.maybeNull(types.string),
    channel: types.maybeNull(types.string),
    thread: false,
    content: types.maybeNull(types.string),
    isOpen: false
  })
  .actions(self => ({
    openImage(url: string, originalUrl?: string) {
      self.isOpen = true
      self.type = 'image'
      self.data = url
      self.originalUrl = originalUrl
    },
    openSettings() {
      self.isOpen = true
      self.type = 'settings'
      self.data = null
    },
    openExperiments() {
      self.isOpen = true
      self.type = 'experiments'
      self.data = null
    },
    openTopic(topic, channel) {
      self.isOpen = true
      self.type = 'topic'
      self.data = topic
      self.channel = channel
    },
    openUpload(channel, thread, content) {
      self.isOpen = true
      self.type = 'upload'
      self.channel = channel
      self.thread = thread
      self.content = content
    },
    openDelete(thread) {
      self.isOpen = true
      self.type = 'delete'
      self.thread = thread
    },
    openLink(url) {
      self.isOpen = true
      self.type = 'link'
      self.data = url
    },
    openDiscordLogin() {
      self.isOpen = true
      self.type = 'discordlogin'
      self.data = null
    },
    close() {
      self.isOpen = false
    }
  }))



// WEBPACK FOOTER //
// ./src/models/Modal.ts