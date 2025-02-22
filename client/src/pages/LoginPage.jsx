import Login from "../components/Login"

const LoginPage = () => {
    return (
        <div className="bg h-screen w-screen flex justify-between bg-gradient-to-r from-[#240b36] to-[#c31432] ">
            <div className="left flex-1 flex items-center justify-center">
            <Login />
            </div>
            <div className="right flex-1 flex items-center justify-center">

            </div>
        </div>
    )
}

export default LoginPage