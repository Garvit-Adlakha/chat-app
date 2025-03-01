import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import Protected from "./components/auth/Protected"

// ... your lazy imports ...

const Home = lazy(() => import("./pages/HomePage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const Signup = lazy(() => import("./pages/SignupPage"))
const MainChat = lazy(() => import("./pages/MainChat"))
const Chat = lazy(() => import("./pages/Chat"))
const Groups = lazy(() => import("./pages/Groups"))
const NotFound = lazy(() => import("./pages/NotFound"))
// Move this to AuthContext
const user =false

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route element={<Protected user={!user} redirect="/"/>}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected routes */}
          <Route element={<Protected user={user} />} >
            <Route path="/chat">
              <Route index element={<MainChat />} />
              <Route path=":chatId" element={<Chat />} />
            </Route>
            <Route path="/groups" element={<Groups />} />
          </Route>

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App