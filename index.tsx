import { useEffect } from "react";
import Modal from '@ui/Modal'
import Sidebar from '@ui/Sidebar'
import ChooseChannel from '@views/ChooseChannel'
import { MessagesView } from '@views/Messages'
import Notifications from 'notify'

import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ThemeProvider } from './ThemeProvider'
import { observer } from 'mobx-react'
import { useCacheLoaded } from '@hooks'
import Authenticate from "@ui/Modal/screens/Authenticate";
import {Locale} from "@lib/Locale";
import { Loading } from '@ui/Overlays/Loading/elements'
import { Main } from './elements'
import Notification from "@ui/Overlays/Notification";
import api from "embed-api";

const App = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    const callback = (data: string | Record<string, string>) => {
      if (typeof data === 'string') {
        navigate(data);
      } else if (data instanceof Object) {
        if (!data.guild || !data.channel) throw new Error('Attempted to navigate without passing required data');

        navigate(`channels/${data.guild}/${data.channel}`);
      }
    };

    api.on('navigate', callback);
    return () => api.removeListener('navigate', callback);
  });

  const cacheLoaded = useCacheLoaded()
  if (!cacheLoaded) return null;

  return (
    <Locale>
      <ThemeProvider>
        <Notification>
          <Routes>
            <Route path="/channels/:guild" element={
              <>
                <Loading id="loading" />
                <Authenticate />
                <Modal />
                <Notifications />
                <Main>
                  <Sidebar />
                  <Outlet />
                </Main>
              </>
            }>
              <Route path=":channel" element={<MessagesView />} />
              <Route path="" element={<ChooseChannel />} />
            </Route>

            <Route path="*" element={<Navigate replace to="/channels/299881420891881473" />} />
          </Routes>
          </Notification>
      </ThemeProvider>
    </Locale>
  )
});


// class App extends React.PureComponent<
//   ChildProps<RouteComponentProps<any>, Locale>
// > {
//   state = {
//     catalogs: null
//   }

//   async componentDidMount() {
//     await this.getCatalogs()
//   }

//   async componentWillReceiveProps(nextProps) {
//     if (
//       nextProps.data.locale.language !== this.props.data.locale.language ||
//       nextProps.data.locale.translations !== this.props.data.locale.translations
//     ) {
//       await this.getCatalogs(nextProps)
//     }
//   }

//   async getCatalogs(props = this.props) {
//     const { language, translations } = props.data.locale
// const $catalog = await loadCatalog(language)

//     const catalog = produce($catalog, draftState => {
//       translations.forEach(
//         ([id, translation]) => (draftState.messages[id] = translation)
//       )
//     })

//     this.setState({ catalogs: { [language]: catalog } })
//   }

//   render() {
//     const { language } = this.props.data.locale

//     return (
//       <I18nProvider
//         language={language}
//         i18n={i18n}
//         catalogs={this.state.catalogs || undefined}
//       >
//         <ThemeProvider>
//           <this.app />
//         </ThemeProvider>
//       </I18nProvider>
//     )
//   }
// }

process.on('unhandledRejection', (err: any) => {
  console.error(err);
});

process.on('uncaughtException', (err: any) => {
  console.error(err);
});

export default App



// WEBPACK FOOTER //
// ./src/app/index.tsx