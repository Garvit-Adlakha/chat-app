import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { EyeIcon, EyeOffIcon } from "lucide-react"

const Login = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const form = useForm({
        defaultValues: {
            username: '',
            password: ''
        }
    })

    const onSubmit = (data) => {
        console.log(data)
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <Card className="w-full h-96 w-96 p-6 ring ring-1 ring-white/20 max-w-md bg-black/20 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-black/25 hover:translate-y-[-2px] transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center text-pink-600">Welcome Back</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/70">Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="bg-transparent border-white/20 text-white"
                                                required
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/70">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showPassword ? "text" : "password"}
                                                    className="bg-transparent border-white/20 text-white pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                                                >
                                                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-center items-center mt-6">
                                <Button
                                    type="submit"
                                    className="px-12 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white cursor-pointer ring ring-1 ring-white/20 hover:ring-white/40"
                                >
                                    Login
                                </Button>
                            </div>
                            <p className="px-4 py-2 text-center text-white/70 mt-4">
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/signup")}
                                    className="text-pink-500 hover:text-pink-400 cursor-pointer"
                                >
                                    Sign up
                                </button>
                            </p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login
