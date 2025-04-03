import { Navigate, Outlet } from "react-router-dom";
import { AppLayoutLoader } from "../layout/Loaders";
import { useQuery } from "@tanstack/react-query";
import userService from "../../service/userService";

const Protected = ({ children, loading, redirect = '/login', requiredAuth = true }) => {
    const { data: user, isLoading: queryLoading } = useQuery({
        queryKey: ['user'],
        queryFn: () => userService.currentUser(),
    });
    
    if (loading || queryLoading) {
        return <AppLayoutLoader />;
    }

    // If requiredAuth is true, we need a user to proceed
    // If requiredAuth is false, we need NO user to proceed
    const authConditionMet = requiredAuth ? !!user : !user;
    
    if (!authConditionMet) {
        return <Navigate to={redirect} replace />;
    }
    
    return children ? children : <Outlet />;
}

export default Protected;