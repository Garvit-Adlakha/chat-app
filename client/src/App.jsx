import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import Protected from "./components/auth/Protected"
import { AppLayoutLoader, LayoutLoader } from "./components/layout/Loaders"
import HomePage from "./pages/HomePage"

// ... your lazy imports ...

const Home = lazy(() => import("./pages/HomePage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const Signup = lazy(() => import("./pages/SignupPage"))
const MainChat = lazy(() => import("./pages/MainChat"))
const Groups = lazy(() => import("./pages/Groups"))
const NotFound = lazy(() => import("./pages/NotFound"))
// Move this to AuthContext
const user =true

const App = () => {
  return (
    <BrowserRouter>
        <Suspense fallback={<AppLayoutLoader />}>
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
              <Route path=":chatId" element={<MainChat />} />
            </Route>
            <Route path="/groups" element={<Groups />} />
          </Route>

          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
         
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
    </BrowserRouter>
  )
}

export default App