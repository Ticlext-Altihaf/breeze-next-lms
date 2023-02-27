import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import AppLayout from '@/components/Layouts/AppLayout'
import CoursesGrid from '@/components/Layouts/CoursesGrid'

export default function TeacherHome() {
    const { user } = useAuth({ middleware: 'teacher' })
    const router = useRouter()
    if (user && !user.is_teacher && !user.is_admin) {
        router.push('/') //Major L
    }
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const getLink = path => `${router.basePath}${path}`
    const fetchCourses = async () => {
        if (!user) return
        try {
            const response = await axios.get('/courses?author_id=' + user.id)
            setCourses(response.data.data)
        } catch (error) {
            setError(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCourses().then(r => console.log(r))
    }, [user])
    return (
        <AppLayout
            user={user}
            header={
                <h2 className="font-semibold text-xl leading-tight flex justify-between">
                    Teacher - Dashboard
                    <Link
                        href="/courses/create"
                        passHref={true}
                        className="font-semibold text-xl leading-tight">
                        Create a course
                    </Link>
                </h2>
            }>
            <Head>
                <title>Teacher - Dashboard</title>
            </Head>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {courses && courses.length === 0 && (
                <div className="p-10 flex justify-center">
                    <h2 className="font-semibold text-xl leading-tight">
                        You have no courses yet.
                    </h2>
                </div>
            )}
            {courses && <CoursesGrid courses={courses} />}
        </AppLayout>
    )
}
