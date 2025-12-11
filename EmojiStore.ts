import matchSorter from 'match-sorter'

export interface Emoji {
  category: string
  emoji: string
  keywords: string[]
  animated: boolean
  available: boolean
}

export class EmojiStore extends Array<Emoji> {
  constructor(...emojis: Emoji[]) {
    super(...emojis)

    // Babel fix
    if (emojis.length && !this.length) this.push(...emojis)
  }

  public get(name: string): Emoji {
    const results = this.find(
      ({ emoji, keywords }) => emoji === name || keywords.includes(name)
    )
    return results
  }

  public getCategory(category: string): EmojiStore {
    const emojis = this.filter(e => e.category === category)
    return new EmojiStore(...emojis)
  }

  public query(query: string) {
    const results = matchSorter(this, query, {
      keys: [
        {
          minRanking: matchSorter.rankings.STRING_CASE_ACRONYM,
          maxRanking: matchSorter.rankings.STARTS_WITH,
          threshold: matchSorter.rankings.STARTS_WITH,
          key: 'keywords'
        }
      ]
    })

    return new EmojiStore(...results)
  }
}



// WEBPACK FOOTER //
// ./src/services/Emoji/EmojiStore.ts