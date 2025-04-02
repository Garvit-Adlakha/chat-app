import { lazy, Suspense } from "react"
import Protected from "../components/auth/Protected"
import { AppLayoutLoader, HomePageLoader, LoginPageLoader } from "../components/layout/Loaders"
import { Route, Routes } from "react-router-dom"
import { useQuery } from "@tanstack/react-query";
import userService from "../service/userService";
import ErrorBoundary from "../components/shared/ErrorBoundary";

const HomePage = lazy(() => import("../pages/HomePage"))
const LoginPage = lazy(() => import("../pages/LoginPage"))
const Signup = lazy(() => import("../pages/SignupPage"))
const MainChat = lazy(() => import("../pages/MainChat"))
const NotFound = lazy(() => import("../pages/NotFound"))

const appRouter = () => {
  const { data: user, isPending, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: userService.currentUser,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const loading = isPending || isLoading;
  if (loading) {
    return <AppLayoutLoader />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<HomePageLoader />}>
            <HomePage />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<LoginPageLoader />}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<LoginPageLoader />}>
            <Signup />
          </Suspense>
        } />
        <Route path="/chat/*" element={
          <Protected>
            <MainChat />
          </Protected>
        } />
        <Route path="*" element={
          <Suspense fallback={<AppLayoutLoader />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </ErrorBoundary>
  );
};

export default appRouter;
