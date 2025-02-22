import Signup from "../components/Signup"

const SignupPage = () => {
    return (
        <div className="bg h-screen w-screen flex justify-between bg-gradient-to-r from-[#240b36] to-[#c31432] ">
            <div className="left flex-1 flex items-center justify-center">
            <Signup />
            </div>
            <div className="right flex-1 flex items-center justify-center">

            </div>
        </div>
    )
}

export default SignupPage