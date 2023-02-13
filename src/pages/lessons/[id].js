import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import axios from '@/lib/axios'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import YoutubeIFrame from '@/components/YoutubeIFrame'

const Course = () => {
    const [lesson, setLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(null)
    const router = useRouter()
    const { id } = router.query
    const getLink = path => `${router.basePath}${path}`
    const fetchCourse = async () => {
        if (!id) return
        try {
            const response = await axios.get('/lessons/' + id)
            setLesson(response.data.data)
        } catch (error) {
            setError(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCourse()
    }, [id])
    
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {lesson && lesson.name}
                </h2>
            }>
            <Head>
                <title>Laravel - Dashboard</title>
            </Head>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {lesson && (
                <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {lesson.video_url &&
                        lesson.video_url
                            .toString()
                            .startsWith('https://www.youtube.com/') && (
                            <YoutubeIFrame
                                videoId={lesson.video_url.split('v=')[1]}
                                videoTitle="Lesson"
                            />
                        )}
                    {lesson.attachment_path && (
                        <a
                            href={lesson.attachment_path}
                            target="_blank"
                            rel="noreferrer">
                            <div className="max-w-sm rounded overflow-hidden shadow-lg">
                                <img
                                    className="w-full"
                                    src={lesson.attachment_path}
                                    alt="Sunset in the mountains"
                                />
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">
                                        Attachment
                                    </div>
                                    <p className="text-gray-700 text-base">
                                        {lesson.description}
                                    </p>
                                </div>
                            </div>
                        </a>
                    )}
                </div>
            )}
        </AppLayout>
    )
}

export default Course
