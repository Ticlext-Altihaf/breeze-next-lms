import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import AppLayout from '@/components/Layouts/AppLayout'

export default function TeacherHome() {
    const { user } = useAuth({ middleware: 'guest' })
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
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight flex justify-between">
                    Teacher - Dashboard
                    <Link
                        href="/courses/create"
                        passHref={true}
                        className="font-semibold text-xl text-gray-800 leading-tight">
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
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        You have no courses yet.
                    </h2>
                </div>
            )}
            {courses && (
                <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {courses.map(course => (
                        <a
                            href={getLink(`/courses/${course.id}`)}
                            key={course.id}>
                            <div className="max-w-sm rounded overflow-hidden shadow-lg">
                                {course.image_url && (
                                    <img
                                        className="w-full"
                                        src={course.image_url}
                                        alt={course.name}
                                    />
                                )}
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">
                                        {course.name}
                                    </div>
                                    <p className="text-gray-700 text-base">
                                        {course.description}
                                    </p>
                                </div>
                                <div className="px-6 pt-4 pb-2">
                                    {course.categories.map(category => (
                                        <span
                                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                                            key={category.id}>
                                            {category.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </AppLayout>
    )
}
