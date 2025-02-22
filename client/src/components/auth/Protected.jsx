import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import PropTypes from 'prop-types'

export const Protected = ({ children, authentication }) => {
    const navigate = useNavigate()
    const authStatus = false
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (authStatus !== authentication) {
            navigate(authentication ? '/login' : '/')
        }
        setIsLoading(false)
    }, [authentication, authStatus, navigate])

    if (isLoading) {
        return <div>Loading...</div>
    }

    return <>{children}</>
} 

Protected.propTypes = {
    children: PropTypes.node.isRequired,
    authentication: PropTypes.bool.isRequired
}
