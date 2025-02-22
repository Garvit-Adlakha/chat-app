import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { EyeIcon, EyeOffIcon, Camera } from "lucide-react"

const Signup = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const form = useForm({
        defaultValues: {
            name: '',
            username: '',
            password: '',
            confirmPassword: '',
            status: ''
        }
    })

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatar(file)
            const reader = new FileReader()
            reader.onload = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = (data) => {
        if (data.password !== data.confirmPassword) {
            alert("Passwords don't match!")
            return
        }
        const submitData = {
            ...data,
            avatar
        }
        console.log(submitData)
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <Card className="w-full max-w-md bg-black/20 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-black/25 hover:translate-y-[-2px] transition-all duration-300">                <CardHeader>
                <CardTitle className="text-3xl font-bold text-center text-pink-600">Create Account</CardTitle>
            </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="relative w-40 h-40 mx-auto mb-6">
                                <Avatar className='w-40 h-40'>
                                    <AvatarImage src={avatarPreview} />
                                    <AvatarFallback>
                                        <img src="https://github.com/shadcn.png" />
                                    </AvatarFallback>
                                </Avatar>
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition-colors">
                                    <Camera className="text-white" size={20} />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/70">Name</FormLabel>
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
                                                        type={showPassword ? 'text' : 'password'}
                                                        className="bg-transparent border-white/20 text-white pr-10"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70"
                                                    >
                                                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/70">Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="bg-transparent border-white/20 text-white"
                                                    required
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white/70">Status</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="bg-transparent border-white/20 text-white"
                                                placeholder="Hey there! I'm using Chat App"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-center items-center mt-6">
                                <Button
                                    type="submit"
                                    className="px-12 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white cursor-pointer ring ring-1 ring-white/20 hover:ring-white/40"
                                >
                                    Signup
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <p className="py-2 px-4 text-center text-white/70 mt-4">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-pink-500 hover:text-pink-400 cursor-pointer"
                        >
                            Login
                        </button>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Signup
