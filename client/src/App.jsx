import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import Protected from "./components/auth/Protected"
import LoadingSpinner from "./components/LoadingSpinner" // Create this component
import NotFound from "./pages/NotFound" // Create this component

// ... your lazy imports ...

// Move this to AuthContext
const user = true

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
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
      </Suspense>
    </BrowserRouter>
  )
}

export default App