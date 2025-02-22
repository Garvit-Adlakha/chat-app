import {lazy} from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Protected } from './components/auth/Protected'

//dynamic import
const Home = lazy(() => import('./pages/Home'))
const LoginPage=lazy(()=> import ('./pages/LoginPage'))
const Groups=lazy(()=> import ('./pages/Groups'))
const Chat=lazy(()=>{import ('./pages/Chat')})
const SignupPage=lazy(()=> import ('./pages/SignupPage'))

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path='/login' element={
                <Protected authentication={false}>
                  <LoginPage /> 
                </Protected>
                }
      />
      <Route path='/signup' element={
            <Protected authentication={false}>
              <SignupPage />
            </Protected>
            }/>
      <Route path='/groups' element={
        <Protected authentication={true}>
        <Groups />
        </Protected>
        }/>
      <Route path='/chat/:slug' element={ 
        <Protected authentication={true}>
        <Chat />
        </Protected>
        }/>
        <Route path='*' element={<>Page not found</>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
