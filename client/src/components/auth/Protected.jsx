import { Navigate, Outlet } from "react-router-dom";

const Protected = ({ children, user, loading = false, redirect = '/login' }) => {
    if (loading) {
        return <div>Loading...</div>; // You can replace this with a spinner or custom loading component
    }

    if (!user) {
        return <Navigate to={redirect} />;
    }
    
    return children?children:<Outlet />;
}

export default Protected;