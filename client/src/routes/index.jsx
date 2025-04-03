import { lazy, Suspense } from "react"
import Protected from "../components/auth/Protected"
import { AppLayoutLoader, HomePageLoader, LoginPageLoader } from "../components/layout/Loaders"
import { Route, Routes } from "react-router-dom"

// Lazy loaded components
const HomePage = lazy(() => import("../pages/HomePage"))
const LoginPage = lazy(() => import("../pages/LoginPage"))
const Signup = lazy(() => import("../pages/SignupPage"))
const MainChat = lazy(() => import("../pages/MainChat"))
const NotFound = lazy(() => import("../pages/NotFound"))

const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes - no auth checks */}
      <Route path="/" element={
        <Suspense fallback={<HomePageLoader />}>
          <HomePage />
        </Suspense>
      } />
      
      {/* Non-authenticated routes */}
      <Route path="/login" element={
        <Suspense fallback={<LoginPageLoader />}>
          <Protected requiredAuth={false} redirect="/chat">
            <LoginPage />
          </Protected>
        </Suspense>
      } />
      
      <Route path="/signup" element={
        <Suspense fallback={<LoginPageLoader />}>
          <Protected requiredAuth={false} redirect="/chat">
            <Signup />
          </Protected>
        </Suspense>
      } />

      {/* Protected routes - only for authenticated users */}
      <Route path="/chat" element={
        <Suspense fallback={<AppLayoutLoader />}>
          <Protected requiredAuth={true} redirect="/login">
            <MainChat />
          </Protected>
        </Suspense>
      } />
      
      <Route path="/chat/:chatId" element={
        <Suspense fallback={<AppLayoutLoader />}>
          <Protected requiredAuth={true} redirect="/login">
            <MainChat />
          </Protected>
        </Suspense>
      } />

      {/* 404 route */}
      <Route path="*" element={
        <Suspense fallback={<HomePageLoader />}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
};

export default AppRouter;
