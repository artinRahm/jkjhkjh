import {action, autorun, observable} from "mobx";
import { GuildInfo_guild, Message, Message_thread, Settings_settings } from "@generated";
import {ICategory} from "@ui/Sidebar/Channels/categorise";
import { EmojiStore } from "@services/Emoji";
import { defaultEmojis } from "@services/Emoji/defaultEmojis";
import { MessageDataModified } from "@ui/Messages/Message";

type Thread = Pick<Message_thread, 'id' | 'name' | 'locked'> & Partial<Pick<Message_thread, 'archivedAt'>>;

export class GeneralStore {
  @observable appName = 'WidgetBot';

  @observable needsUpdate: boolean = false;
  @observable loading?: boolean;
  @observable fetchGuild?: Function;
  @observable guild?: GuildInfo_guild;
  @observable settings?: Settings_settings;
  @observable channels: ICategory[] = [];
  @observable menuOpen: boolean = false;
  @observable activeThread?: Thread;
  @observable threadFullscreen: boolean = false;
  @observable openedDefaultThread: boolean = false;
  @observable file?: File;
  @observable emojis = new EmojiStore(...defaultEmojis);
  @observable pins?: Message[];
  @observable pinsOpen: boolean = false;
  @observable messageToDelete?: MessageDataModified;
  @observable unreadChannels = new Set<string>();
  @observable accessibility?: Set<string>;

  constructor() {
    autorun(() => {
      if (this.needsUpdate) {
        this.fetchGuild?.();
        this.needsUpdate = false;
      }
    })
  }

  @action toggleMenu(res: boolean = this.menuOpen) {
    this.menuOpen = res
  }

  @action setGuild(guild: GuildInfo_guild) {
    this.guild = guild
  }

  @action setSettings(settings: Settings_settings) {
    this.settings = settings
  }

  @action setChannels(channels: ICategory[]) {
    this.channels = channels
  }

  @action setActiveThread(data: Thread) {
    this.activeThread = data;
  }

  @action setThreadFullscreen(fullscreen: boolean) {
    this.threadFullscreen = fullscreen;
  }

  @action clearThread() {
    // TODO: Set activeThread to null - this is for testing
    this.activeThread = null;
    this.threadFullscreen = false;
  }

  @action setOpenedDefaultThread() {
    this.openedDefaultThread = true;
  }

  @action setFile(file: File) {
    this.file = file;
  }

  @action setEmojis(emojis: EmojiStore) {
    this.emojis = emojis;
  }

  @action setPins(pins: Message[]) {
    this.pins = pins;
  }

  @action togglePins(res: boolean = !this.pinsOpen) {
    this.pinsOpen = res
  }

  @action setMessageToDelete(msg: MessageDataModified) {
    this.messageToDelete = msg
  }

  @action addUnreadChannel(channel: string) {
    this.unreadChannels.add(channel)
  }

  @action readChannel(channel: string) {
    this.unreadChannels.delete(channel)
  }

  @action setAccessibility(data?: string) {
    this.accessibility = new Set(data?.split(','))
  }
}

// export default new GeneralStore();
export const generalStore = new GeneralStore();



// WEBPACK FOOTER //
// ./src/stores/general.ts