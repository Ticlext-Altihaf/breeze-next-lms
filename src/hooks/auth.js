import useSWR from 'swr'
import axios from '@/lib/axios'
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

    const csrf = async () => {
        //cookiesless
    }

    const register = async ({ setErrors, ...props }) => {
        await csrf()

        setErrors([])

        axios
            .post('/register', props)
            .then(() => mutate())
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
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post('/login', props)
            .then(() => mutate())
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        await csrf()

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
        await csrf()

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
        await csrf()
        if (!error) {
            try {
                await axios.post('/logout').then(() => mutate())
            } catch (error) {
                /* empty */
            }
        }

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
            if (middleware === 'teacher' && !user?.is_teacher) router.push('/')
        }
    }, [user, error])

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
