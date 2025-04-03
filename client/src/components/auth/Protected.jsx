import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AppLayoutLoader } from "../layout/Loaders";
import { useQuery } from "@tanstack/react-query";
import userService from "../../service/userService";
import { useEffect } from "react";
import PropTypes from 'prop-types';

const Protected = ({ children, loading, redirect = '/login', requiredAuth = true }) => {
    const { data: user, isLoading: queryLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: () => userService.currentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: false,
    });

    const navigate = useNavigate();
    const authConditionMet = requiredAuth ? !!user : !user;

    if (!authConditionMet) {
        return <Navigate to={redirect} replace />;
    }

    return children ? children : <Outlet />;
};

Protected.propTypes = {
    children: PropTypes.node,
    loading: PropTypes.bool,
    redirect: PropTypes.string,
    requiredAuth: PropTypes.bool
};

export default Protected;
