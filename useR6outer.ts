import { useMatch } from 'react-router-dom';

interface Params {
  guild: string
  channel?: string
}

export const useRouter = () => {
  const channelParams = useMatch({path: '/channels/:guild/:channel'})?.params
  const guildParams = useMatch({path: '/channels/:guild'})?.params
  return (channelParams ?? guildParams) as Params
}



// WEBPACK FOOTER //
// ./src/hooks/useRouter.ts