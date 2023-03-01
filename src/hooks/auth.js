import useSWR from 'swr'
import axios, { removeToken, setToken } from '@/lib/axios'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export const useAuth = ({ middleware, redirectIfAuthenticated = '/' } = {}) => {
    const router = useRouter()

    const { data: user, error, mutate } = useSWR('/api/user', () =>
        axios
            .get('/user')
            .then(res => res.data)
            .catch(error => {
                if (error.response.status !== 409) throw error

                router.push('/verify-email')
            }),
    )

    const deviceName = async () => {
        //get device id
        let deviceName = localStorage.getItem('device_name')
        if (!deviceName) {
            deviceName = navigator.userAgent + ';' + new Date().getTime()
            localStorage.setItem('device_name', deviceName)
        }
        return deviceName
    }

    const register = async ({ setErrors, ...props }) => {
        props.device_name = await deviceName()
        setErrors([])

        axios
            .post('/register', props)
            .then(() => {
                login({ setErrors, ...props })
            })
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const isTeacher = lesson => {
        if (!user) return false
        if (user.is_admin) return true
        if (!lesson || !lesson.author) return false
        if (lesson.author.id === user.id && user.is_teacher) {
            return true
        }
        return false
    }

    const login = async ({ setErrors, setStatus, ...props }) => {
        props.device_name = await deviceName()
        setErrors([])
        if (setStatus) setStatus(null)
        const remember = props.remember
        axios
            .post('/login', props)
            .then(response => {
                const token = response.data.token
                setToken(token, remember)
                mutate()
            })
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        await deviceName()

        setErrors([])
        setStatus(null)

        axios
            .post('/forgot-password', { email })
            .then(response => setStatus(response.data.status))
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        await deviceName()

        setErrors([])
        setStatus(null)

        axios
            .post('/reset-password', { token: router.query.token, ...props })
            .then(response =>
                router.push('/login?reset=' + btoa(response.data.status)),
            )
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resendEmailVerification = ({ setStatus }) => {
        axios
            .post('/email/verification-notification')
            .then(response => setStatus(response.data.status))
    }

    const logout = async () => {
        removeToken()
        //use window.location instead of router.push to force reload
        window.location.pathname = '/login'
    }

    useEffect(() => {
        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified_at
        ) {
            router.push(redirectIfAuthenticated)
        }
        if (middleware === 'guest') {
            if (redirectIfAuthenticated && user)
                router.push(redirectIfAuthenticated)
            return
        }

        if (error) logout()
        else if (user) {
            if (middleware === 'admin' && !user?.is_admin) router.push('/')
            if (
                middleware === 'teacher' &&
                (!user?.is_teacher || !user?.is_admin)
            ) {
                router.push('/')
            }
        }
    }, [user, error])
    //From the code above the "middleware" is actually role
    //default role is authenticated user
    //middleware = 'guest' means user is not authenticated
    //middleware = 'admin' means user is admin
    //middleware = 'teacher' means user is teacher

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
        isTeacher,
    }
}
