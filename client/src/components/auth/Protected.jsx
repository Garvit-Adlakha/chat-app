import { Navigate, Outlet } from "react-router-dom";
import { AppLayoutLoader } from "../layout/Loaders";

const Protected = ({ children, user, loading , redirect = '/login' }) => {
    if (loading) {
        <AppLayoutLoader />
    }

    if (!user) {
        return <Navigate to={redirect} replace/>;
    }
    
    return children?children:<Outlet />;
}

export default Protected;