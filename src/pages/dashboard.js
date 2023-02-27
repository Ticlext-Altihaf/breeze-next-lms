import AppLayout from '@/components/Layouts/AppLayout'
import CoursesGrid from '@/components/CoursesGrid'
import Head from 'next/head'
import axios from '@/lib/axios'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/auth'

const Dashboard = () => {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user, isTeacher } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const getLink = path => `${router.basePath}${path}`
    const fetchCourses = async () => {
        try {
            const response = await axios.get('/courses')
            setCourses(response.data.data)
        } catch (error) {
            setError(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCourses().then(r => console.log(r))
    }, [])
    return (
        <AppLayout
            user={user}
            header={
                <h2 className="font-semibold text-xl leading-tight">
                    Dashboard
                </h2>
            }>
            <Head>
                <title>Laravel - Dashboard</title>
            </Head>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {courses && <CoursesGrid courses={courses} />}
        </AppLayout>
    )
}

export default Dashboard
