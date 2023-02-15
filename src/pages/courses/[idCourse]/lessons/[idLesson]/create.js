import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import AppLayout from '@/components/Layouts/AppLayout'
import Link from 'next/link'
import Head from 'next/head'
import Editor from '@/components/Markdown/Editor'
import Preview from '@/components/Markdown/Preview'

export default function CreateContent(content) {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()

    const [error, setError] = useState(null)
    const [errors, setErrors] = useState([])
    const [course, setCourse] = useState(null)

    const [text, setText] = useState('')
    const [title, setTitle] = useState('')
    const [type, setType] = useState('youtube')

    const { idCourse, idLesson } = router.query

    useEffect(() => {
        if (idCourse) {
            axios
                .get(`/courses/${idCourse}`)
                .then(res => {
                    setCourse(res.data.data)
                })
                .catch(err => {
                    setError(err)
                })
        }
    }, [idCourse])

    if (user && !user.is_teacher && !user.is_admin) {
        router.push('/') //Major L
    }
    //check course author
    if (course && course.author.id !== user.id && !user.is_admin) {
        router.push('/') //Major L
    }
    const getLink = path => `${router.basePath}${path}`
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight flex justify-between">
                    Teacher - {course ? course.name : ''} -{' '}
                </h2>
            }>
            <Head>
                <title>Teacher - Dashboard</title>
            </Head>
            {error && <div>Error: {error.message}</div>}
            {errors &&
                Object.keys(errors).map((key, index) => (
                    <div key={index} className="text-red-500">
                        {errors[key]}
                    </div>
                ))}

            <div className="mt-24 divide-y divide-gray-200 pb-8 xl:divide-y-0 flex flex-col justify-between xl:px-72 md:px-24 sm:px-12 px-4 space-y-1 dark:divide-gray-700">
                <input
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 sm:text-sm border-gray-30 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    type="text"
                    placeholder={'Title'}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <select
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 sm:text-sm border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    value={type}
                    onChange={e => setType(e.target.value)}>
                    <option value="markdown">Markdown</option>
                    <option value="youtube">Youtube Video</option>
                </select>
                {type === 'youtube' && (
                    <input
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 sm:text-sm border-gray-30 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        type="text"
                        placeholder={'Youtube Video URL'}
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                )}
                {type === 'markdown' && (
                    <div className="flex flex-1 w-full gap-4">
                        <Editor
                            initialDoc={text}
                            onChange={doc => setText(doc)}
                        />
                        <Preview doc={text} />
                    </div>
                )}
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
                    onClick={() => {
                        setErrors({})
                        //validate
                        if (!title) {
                            setErrors({ title: 'Title is required' })
                            return
                        }
                        if (!text) {
                            setErrors({ text: 'Text is required' })
                            return
                        }
                        if (
                            type === 'youtube' &&
                            !text.startsWith(
                                'https://www.youtube.com/watch?v=',
                            ) &&
                            !text.startsWith('https://youtu.be/')
                        ) {
                            setErrors({
                                text: 'A valid Youtube video URL is required',
                            })
                            return
                        }
                        axios
                            .post(`/contents`, {
                                name: title,
                                text,
                                type,
                                lesson_id: idLesson,
                            })
                            .then(res => {
                                router.push(
                                    `/courses/${idCourse}/lessons/${idLesson}`,
                                )
                            })
                            .catch(err => {
                                console.log(err)
                                if (err.response?.data?.errors) {
                                    console.log(err.response.data.errors)
                                    setErrors(err.response.data.errors)
                                } else {
                                    setError(err)
                                }
                            })
                    }}>
                    Create
                </button>
            </div>
        </AppLayout>
    )
}
