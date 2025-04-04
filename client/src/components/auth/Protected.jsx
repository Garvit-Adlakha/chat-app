import { Navigate, Outlet} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import userService from "../../service/userService";

const Protected = ({ children, loading, redirect = '/login', requiredAuth = true }) => {
    const { data: user, isError } = useQuery({
        queryKey: ['user'],
        queryFn: () => userService.currentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: false,
        // Return undefined on error to trigger redirect
        onError: () => undefined
    });

    // Redirect on error or when auth condition is not met
    if (isError || (!user && requiredAuth) || (user && !requiredAuth)) {
        return <Navigate to={redirect} replace />;
    }

    return children ? children : <Outlet />;
};

export default Protected;
