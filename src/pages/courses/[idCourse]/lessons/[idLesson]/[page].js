import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import axios from '@/lib/axios'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import YoutubeIFrame from '@/components/YoutubeIFrame'

import Link from 'next/link'
import * as type from '@/lib/type'
import { useAuth } from '@/hooks/auth'
import Preview from '@/components/Markdown/Preview'
import Dropdown from '@/components/Dropdown'
import { DropdownButton } from '@/components/DropdownLink'

const Course = () => {
    const [lesson, setLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const { idLesson, idCourse, page: pageStr } = router.query
    const page = parseInt(pageStr + '')
    const getLink = path => `${router.basePath}${path}`
    const fetchCourse = async () => {
        if (!idLesson) return
        try {
            const response = await axios.get('/lessons/' + idLesson)
            setLesson(response.data.data)
        } catch (error) {
            setError(error)
        }
        setLoading(false)
    }
    useEffect(() => {
        fetchCourse()
    }, [idLesson])

    function setPage(nextPage) {
        //check next page exists
        let maxPage = lesson?.contents?.length || 9999
        if (nextPage > maxPage) {
            nextPage = maxPage
        }
        if (page !== nextPage) {
            router.push(
                `/courses/${idCourse}/lessons/${idLesson}/${nextPage}`,
                undefined,
                { shallow: true },
            )
        }
    }

    if (page < 1) {
        setPage(1)
    }
    function onNext(data) {
        if (data) {
            console.log(data)
        }
        const input = document.getElementById('input')
        if (input) {
            input.value = ''
        }
        if (isFinalPage) {
            router.push(`/courses/${idCourse}`)
        } else {
            setPage(page + 1)
        }
    }

    const isTheAuthor =
        lesson && user && (lesson.course.author_id === user.id || user.is_admin)
    const content = lesson && lesson.contents[page - 1]
    const isFinalPage = page === lesson?.contents?.length
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl leading-tight flex justify-between">
                    {lesson && (
                        <div>
                            <Link href={`/courses/${idCourse}`} passHref={true}>
                                {lesson.name}
                            </Link>{' '}
                            {content && (
                                <select
                                    className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:focus:ring-gray-600 dark:focus:border-gray-600"
                                    onChange={e => {
                                        setPage(parseInt(e.target.value))
                                    }}>
                                    {lesson.contents.map((content, index) => (
                                        <option
                                            key={index}
                                            value={index + 1}
                                            selected={index + 1 === page}>
                                            Page {index + 1} - {content.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    <div className="hidden sm:flex sm:items-center sm:ml-6">
                        <Dropdown
                            align="right"
                            width="48"
                            trigger={
                                <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                    <div>Menu</div>
                                    <div className="ml-1">
                                        <svg
                                            className="fill-current h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            }>
                            {isTheAuthor && (
                                <DropdownButton
                                    onClick={e => {
                                        e.preventDefault()
                                        router.push(
                                            `/courses/${idCourse}/lessons/${idLesson}/create`,
                                        )
                                    }}>
                                    Add content
                                </DropdownButton>
                            )}
                            {content && isTheAuthor && (
                                <DropdownButton
                                    onClick={e => {
                                        e.preventDefault()
                                        router.push(
                                            `/courses/${idCourse}/lessons/${idLesson}/edit/${content.order_no}`,
                                        )
                                    }}>
                                    Edit content
                                </DropdownButton>
                            )}

                            <DropdownButton
                                onClick={e => {
                                    e.preventDefault()
                                    router.push(`/courses/${idCourse}`)
                                }}>
                                Exit
                            </DropdownButton>
                        </Dropdown>
                    </div>
                </h2>
            }>
            <Head>
                <title>Laravel - Dashboard</title>
            </Head>

            {lesson && lesson.contents.length === 0 && (
                <div className="mt-24 text-center divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0 flex flex-col justify-between xl:px-72 md:px-24 sm:px-12 px-4">
                    <h1 className="text-2xl font-bold">No content</h1>
                </div>
            )}
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {!content && (
                <div className="mt-24 text-center divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0 flex flex-col justify-between xl:px-72 md:px-24 sm:px-12 px-4">
                    <h1 className="text-2xl font-bold">No content</h1>
                </div>
            )}
            {content && (
                <div className="mt-24 divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0 flex flex-col justify-between xl:px-72 md:px-24 sm:px-12 px-4">
                    {content.type === type.lessonTypes.text && (
                        <Preview doc={content.text} className="mt-8" />
                    )}
                    {content.type === type.lessonTypes.youtube_video && (
                        <YoutubeIFrame videoId={content.video_id} />
                    )}
                    {content.type === type.lessonTypes.quiz && <Preview doc={content.text} />}
                    {content.is_true_false && (
                        <div className="flex justify-center xl:mt-8 mt-4">
                            <button
                                onClick={() =>
                                    onNext({
                                        type: type.quizType.true_false,
                                        quiz_id: content.id,
                                        answer_id: 1,
                                    })
                                }
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
                                True
                            </button>
                            <button
                                onClick={() =>
                                    onNext({
                                        type: type.quizType.true_false,
                                        quiz_id: content.id,
                                        answer_id: 0,
                                    })
                                }
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                False
                            </button>
                        </div>
                    )}
                    {content.is_multiple_choice && (
                        <div className="flex justify-center xl:mt-8 mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
                            {content.choices.map((answer, index) => (
                                <button
                                    key={index}
                                    className=" hover:bg-gray-200 text-white font-bold py-2 px-4 rounded disabled:opacity-50 xl:mt-8 mt-4 mr-4 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                                    onClick={() => {
                                        onNext({
                                            type: type.quizType.multiple_choice,
                                            quiz_id: content.id,
                                            answer_id: answer.id,
                                        })
                                    }}>
                                    <Preview doc={answer.text} />
                                </button>
                            ))}
                        </div>
                    )}
                    {content.is_fill_in_the_blank && (
                        <div className="flex justify-center xl:mt-8 mt-4 w-full">
                            <input
                                className="border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                id="input"
                                name="answer"
                                type="text"
                            />
                        </div>
                    )}
                    {!content.is_multiple_choice && !content.is_true_false && (
                        <button
                            onClick={() => {
                                if (content.type === type.lessonTypes.quiz) {
                                    const answer = document.getElementById(
                                        'input',
                                    )
                                    const text = answer.value
                                    if (!text) return
                                    onNext({
                                        type: type.quizType.fill_in_the_blank,
                                        quiz_id: content.id,
                                        answer: text,
                                    })
                                } else {
                                    onNext()
                                }
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded xl:mt-8 mt-4">
                            {isFinalPage ? 'Finish' : 'Next'}
                        </button>
                    )}
                    {page > 1 && (
                        <button
                            onClick={() => {
                                setPage(page - 1)
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded xl:mt-8 mt-4">
                            Previous
                        </button>
                    )}
                </div>
            )}
        </AppLayout>
    )
}

export default Course
