import { lazy, Suspense } from "react"
import Protected from "../components/auth/Protected"
import { AppLayoutLoader, LayoutLoader } from "../components/layout/Loaders"
import { Route, Routes } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import userService from "../service/userService";
const HomePage = lazy(() => import("../pages/HomePage"))
 const LoginPage = lazy(() => import("../pages/LoginPage"))
 const Signup = lazy(() => import("../pages/SignupPage"))
 const MainChat = lazy(() => import("../pages/MainChat"))
 const Groups = lazy(() => import("../pages/Groups"))
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
    <Suspense fallback={<AppLayoutLoader />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<Protected user={!user} loading={loading} redirect="/" />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Protected routes */}
        <Route element={<Protected user={!!user} loading={isLoading} />}>
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
  );
};

export default appRouter;
