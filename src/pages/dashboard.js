import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import axios from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Dashboard = () => {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
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
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }>
            <Head>
                <title>Laravel - Dashboard</title>
            </Head>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {courses && (
                <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {courses.map(course => (
                        <a
                            href={getLink(`/courses/${course.id}`)}
                            key={course.id}>
                            <div className="max-w-sm rounded overflow-hidden shadow-lg">
                                {course.image && (
                                    <img
                                        className="w-full"
                                        src={course.image}
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

export default Dashboard
