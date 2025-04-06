import { Navigate, Outlet} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import userService from "../../service/userService";

const Protected = ({ children, redirect = '/login', requiredAuth = true }) => {
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => userService.currentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: false,
    });

    const authConditionMet = requiredAuth ? !!user : !user;

    if (!authConditionMet) {
        return <Navigate to={redirect} replace />;
    }

    return children ? children : <Outlet />;
};


export default Protected;
