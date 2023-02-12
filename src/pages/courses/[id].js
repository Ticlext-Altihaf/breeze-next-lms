import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import axios from '@/lib/axios'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

function SubjectCard(props) {
    return (
        <div
            className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-none rounded-2xl h-80 w-72 m-10 hover:shadow-xl dark:hover:shadow-dark"
            onClick={() => props.onClick(props.subject.toLowerCase())}>
            <div className="flex justify-center pt-12">
                <img
                    src={props.imgSrc}
                    alt={props.imgAlt}
                    width="180"
                    height="180"
                />
            </div>
            <h2 className="text-gray-800 dark:text-gray-300 font-sans font-medium text-xl pt-8 pl-8">
                {props.subject}
            </h2>
        </div>
    )
}

const Course = () => {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const router = useRouter()
    const { id } = router.query
    const getLink = path => `${router.basePath}${path}`
    const fetchCourse = async () => {
        if (!id) return
        try {
            const response = await axios.get('/courses/' + id)
            setCourse(response.data.data)
        } catch (error) {
            setError(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCourse().then(r => console.log(r))
    }, [id])
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {course && course.name}
                </h2>
            }>
            <Head>
                <title>Laravel - Dashboard</title>
            </Head>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            <div className="flex flex-row flex-wrap justify-center mt-16">
                {course &&
                    course.lessons_sectioned &&
                    Object.entries(course.lessons_sectioned).map(
                        ([section, lessons]) => (
                            <div key={section}>
                                <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {section}
                                    </h3>
                                    {lessons.map(lesson => (
                                        <a
                                            key={lesson.id}
                                            href={getLink(
                                                `/lessons/${lesson.id}`,
                                            )}>
                                            <div className="max-w-sm rounded overflow-hidden shadow-lg">
                                                {lesson.image && (
                                                    <img
                                                        className="w-full"
                                                        src={lesson.image}
                                                        alt={lesson.name}
                                                    />
                                                )}
                                                <div className="px-6 py-4">
                                                    <div className="font-bold text-xl mb-2">
                                                        {lesson.name}
                                                    </div>
                                                    <p className="text-gray-700 text-base">
                                                        {lesson.description}
                                                    </p>
                                                </div>
                                                <div className="px-6 pt-4 pb-2" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ),
                    )}
            </div>
        </AppLayout>
    )
}

export default Course
