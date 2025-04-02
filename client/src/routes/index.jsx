import { lazy, Suspense } from "react"
import Protected from "../components/auth/Protected"
import { AppLayoutLoader, HomePageLoader,LoginPageLoader } from "../components/layout/Loaders"
import { Route, Routes } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import userService from "../service/userService";
const HomePage = lazy(() => import("../pages/HomePage"))
 const LoginPage = lazy(() => import("../pages/LoginPage"))
 const Signup = lazy(() => import("../pages/SignupPage"))
 const MainChat = lazy(() => import("../pages/MainChat"))
 const NotFound = lazy(() => import("../pages/NotFound"))
 // Move this to AuthContext
 
 
 const appRouter = () => {
  
  const { data: user,isPending,isFetching ,isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: userService.currentUser,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const loading = isPending || isLoading  ;
  if (loading) {
    return <AppLayoutLoader />;
  }


  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <Suspense fallback={<HomePageLoader />}>
          <HomePage />
        </Suspense>
      } />

      {/* Auth routes */}
      <Route element={<Protected user={!user} loading={loading} redirect="/" />}>
        <Route path="/login" element={
          <Suspense fallback={<LoginPageLoader />}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<LoginPageLoader/>}>
            <Signup />
          </Suspense>
        } />
      </Route>

      {/* Protected routes */}
      <Route element={<Protected user={!!user} />}>
        <Route path="/chat" element={
          <Suspense fallback={<AppLayoutLoader />}>
            <MainChat />
          </Suspense>
        } />
        <Route path="/chat/:chatId" element={
          <Suspense fallback={<AppLayoutLoader />}>
            <MainChat />
          </Suspense>
        } />
      </Route>

      {/* 404 route */}
      <Route path="*" element={
        <Suspense fallback={<HomePageLoader />}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
};

export default appRouter;
