import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import AppLayout from '@/components/Layouts/AppLayout'
import Link from 'next/link'
import Head from 'next/head'

export default function CreateLesson() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()

    const [error, setError] = useState(null)
    const [errors, setErrors] = useState([])
    const [course, setCourse] = useState(null)

    const [title, setTitle] = useState('')
    const [section, setSection] = useState('')
    const { idCourse } = router.query

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

    function handleSubmit(e) {
        e.preventDefault()
        //validate
        setErrors({})
        if (!title) {
            setErrors({ title: 'Title is required' })
            return
        }
        if (!section) {
            setErrors({ section: 'Section is required' })
            return
        }

        axios
            .post(`/lessons`, {
                name: title,
                section,
                course_id: idCourse,
            })
            .then(res => {
                router.push(`/courses/${idCourse}`)
            })
            .catch(err => {
                if (err.response?.data?.errors) {
                    console.log(err.response.data.errors)
                    setErrors(err.response.data.errors)
                } else {
                    setError(err)
                }
            })
    }

    return (
        <AppLayout
            header={
                <h2 className="font-semibold leading-tight flex justify-between">
                    Teacher - Create Lesson
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
            <section className=" py-1 bg-blueGray-50">
                <div className="w-full lg:w-8/12 px-4 mx-auto mt-6">
                    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
                        <div className="rounded-t bg-white mb-0 px-6 py-6 dark:bg-gray-800">
                            <div className="text-center flex justify-between">
                                <h6 className="text-blueGray-700 text-xl font-bold">
                                    Create Lesson
                                </h6>
                            </div>
                        </div>
                        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                            <form onSubmit={handleSubmit}>
                                <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                                    Lesson Information
                                </h6>
                                <div className="flex flex-wrap">
                                    <div className="w-full lg:w-6/12 px-4">
                                        <div className="relative w-full mb-3">
                                            <label
                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                htmlFor="grid-password">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 dark:bg-gray-700 dark:text-gray-300"
                                                name={'title'}
                                                value={title}
                                                onChange={e =>
                                                    setTitle(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-6/12 px-4">
                                        <div className="relative w-full mb-3">
                                            <label
                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                htmlFor="grid-password">
                                                Section
                                            </label>
                                            <input
                                                type="text"
                                                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 dark:bg-gray-700 dark:text-gray-300"
                                                name={'section'}
                                                value={section}
                                                onChange={e =>
                                                    setSection(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <hr className="mt-6 border-b-1 border-blueGray-300" />
                                <div className="flex justify-end">
                                    <button
                                        className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 dark:bg-gray-700 dark:text-gray-300"
                                        type="submit">
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    )
}
