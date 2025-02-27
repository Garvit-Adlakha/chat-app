import { Link } from "react-router-dom"

const LoginPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    
}
  return (
    <div className="hero min-h-screen bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="hero-content flex-col lg:flex-row-reverse animate-fadeIn">
        <div className="text-center lg:text-left mx-5 text-white">
          <p className="py-6">
          Join us and experience seamless communication. Create your account now and start collaborating instantly!
          </p>
        </div>
        <div className="card bg-black bg-opacity-20  backdrop-blur-lg w-full max-w-md shrink-0 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
          <div className="card-body shadow-2xl animate-slideUp">
            <fieldset className="fieldset text-2xl w-full" onSubmit={handleSubmit}>
              <h1 className="text-3xl text-center m-2 text-white font-bold animate-pulse">Welcome Back</h1>
              <label className="fieldset-label text-white">Email</label>
              <label className="input validator my-2 transition-all hover:border-[#302b63] focus-within:border-[#302b63] bg-opacity-20 bg-black w-full">
                <svg className="h-[1em] opacity-50 text-white transition-all group-hover:opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></g></svg>
                <input type="email" placeholder="mail@site.com" required className="transition-all focus:outline-none w-full bg-transparent text-white placeholder:text-gray-300" />
              </label>
              <div className="validator-hint hidden text-gray-300">Enter valid email address</div>
              <label className="input validator transition-all hover:border-[#302b63] focus-within:border-[#302b63] bg-opacity-20 bg-black w-full">
                <svg className="h-[1em] opacity-50 text-white transition-all group-hover:opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></g></svg>
                <input type="password" required placeholder="Password" minLength="8" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" title="Must be more than 8 characters, including number, lowercase letter, uppercase letter" className="transition-all focus:outline-none w-full bg-transparent text-white placeholder:text-gray-300" />
              </label>
              <p className="validator-hint hidden text-gray-300">
                Must be more than 8 characters, including
                <br />At least one number
                <br />At least one lowercase letter
                <br />At least one uppercase letter
              </p>
              <div><a className="link link-hover transition-colors duration-200 hover:text-[#a898ff] text-gray-300 text-lg">Forgot password?</a></div>
              <button className="btn bg-[#302b63] text-white border-none btn-sm mt-4 transition-all duration-300 hover:bg-[#24243e] hover:scale-105">Login</button>
              <div className="text-sm text-white mt-1"><p>Not Regestered<Link className="mx-1 link link-hover transition-colors duration-200 hover:text-[#a898ff] text-gray-300" to="/signup">Sign up</Link></p></div>           
               </fieldset>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
