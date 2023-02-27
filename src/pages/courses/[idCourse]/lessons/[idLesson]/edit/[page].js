import { useRouter } from 'next/router'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import * as type from '@/lib/type'

import axios from '@/lib/axios'
import Link from 'next/link'
import AppLayout from '@/components/Layouts/AppLayout'
import Editor from '@/components/Markdown/Editor'
import Preview from '@/components/Markdown/Preview'
import Dropdown from '@/components/Dropdown'
import { DropdownButton } from '@/components/DropdownLink'
import Toast from '@/components/Toast'

export default function EditContent() {
    const router = useRouter()
    const { page: pageStr, idLesson, idCourse } = router.query
    const page = parseInt(pageStr + '')
    const [lesson, setLesson] = useState(null)
    var [content, setContent] = useState(lesson?.contents[page - 1] || null)
    const [error, setError] = useState(null)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [doc, setDoc] = useState(content?.text)
    if (!doc && content?.text) {
        setDoc(content?.text)
    }
    //check if error not string
    if (typeof error !== 'string' && error?.message) {
        setError(error + '')
    }
    console.log('doc', doc)
    console.log('content?.text', content?.text)
    console.log('content', content)
    console.log('lesson', lesson)
    if (!content && lesson) {
        const selection = lesson?.contents[page - 1]
        setContent(selection)
    }
    const unsavedChanges = () => {
        if (!content) return false
        return content.text !== doc
    }
    // prompt the user if they try and leave with unsaved changes
    useEffect(() => {
        const warningText =
            'You have unsaved changes - are you sure you wish to leave this page?'
        const handleWindowClose = e => {
            const unsaved = unsavedChanges()
            console.log('unsaved', unsaved)
            if (!unsaved) return
            e.preventDefault()
            return (e.returnValue = warningText)
        }
        const handleBrowseAway = () => {
            const unsaved = unsavedChanges()
            console.log('unsaved', unsaved)
            if (!unsaved) return
            if (window.confirm(warningText)) return
            router.events.emit('routeChangeError')
            throw 'routeChange aborted.'
        }
        window.addEventListener('beforeunload', handleWindowClose)
        router.events.on('routeChangeStart', handleBrowseAway)
        return () => {
            window.removeEventListener('beforeunload', handleWindowClose)
            router.events.off('routeChangeStart', handleBrowseAway)
        }
    }, [content, doc, content?.text])

    const handleDocChange = useCallback(newDoc => {
        setDoc(newDoc)
    }, [])

    useEffect(() => {
        if (idLesson) {
            axios
                .get(`/lessons/${idLesson}`)
                .then(res => {
                    if (res.data.data.contents) {
                        setLesson(res.data.data)
                    }
                })
                .catch(err => {
                    console.log(err)
                    if (err.response?.data?.errors) {
                        console.log(err.response.data.errors)
                    } else {
                        setError(err)
                    }
                })
        }
    }, [idLesson])

    if (page < 1 || page > lesson?.contents.length) {
        return (
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight flex justify-between">
                        Teacher - {lesson?.course?.name} - {lesson?.name}
                    </h2>
                }>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <p className="text-2xl font-bold">
                        There is no page {page} in this lesson
                    </p>
                    <Link
                        href={`/courses/${idCourse}/lessons/${idLesson}/edit`}>
                        <a className="text-blue-500 underline">
                            Go back to lesson
                        </a>
                    </Link>
                </div>
            </AppLayout>
        )
    }

    if (content) {
        let saveContent = e => {
            e.preventDefault()
            const data = {
                name: content.name,
                text: doc,
                type: content.type,
                lesson_id: idLesson,
            }
            axios
                .put(`/contents/${content.id}`, data)
                .then(res => {
                    console.log(res)
                    if (res.data.data) {
                        setContent({
                            ...content,
                            ...data,
                        })
                        setSaveSuccess(true)
                        setTimeout(() => {
                            setSaveSuccess(false)
                        }, 2000)
                    }
                })
                .catch(err => {
                    console.log(err)
                    if (err.response?.data?.errors) {
                        console.log(err.response.data.errors)
                        let errorMessage = ''
                        for (const key in err.response.data.errors) {
                            errorMessage += err.response.data.errors[key]
                        }
                        setError(errorMessage)
                    } else {
                        setError(err)
                    }
                    setTimeout(() => {
                        setError(null)
                    }, 2000)
                })
        }
        let deleteContent = e => {
            e.preventDefault()
            axios
                .delete(`/contents/${content.id}?type=${content.type}`)
                .then(res => {
                    console.log(res)
                    router.push(`/courses/${idCourse}/lessons/${idLesson}`)
                })
                .catch(err => {
                    console.log(err)
                    if (err.response?.data?.errors) {
                        console.log(err.response.data.errors)
                    } else {
                        setError(err)
                    }
                })
        }
        const isQuiz = content.type === type.lessonTypes.quiz
        return (
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl leading-tight flex justify-between">
                        <input
                            type="text"
                            className="text-2xl font-bold text-gray-800 dark:text-gray-100 bg-transparent border-none focus:outline-none"
                            value={content?.name}
                            onChange={e => {
                                setContent({
                                    ...content,
                                    name: e.target.value,
                                })
                            }}
                        />
                        {/* Settings Dropdown */}
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
                                <DropdownButton onClick={saveContent}>
                                    Save
                                </DropdownButton>
                                <DropdownButton onClick={deleteContent}>
                                    Delete
                                </DropdownButton>
                                <DropdownButton
                                    onClick={e => {
                                        e.preventDefault()
                                        router.push(
                                            `/courses/${idCourse}/lessons/${idLesson}/${page}`,
                                        )
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
                <Toast
                    show={saveSuccess}
                    message="Saved successfully"
                    color="success"
                />
                <Toast show={error} message={error} color="error" />
                <div>
                    <main
                        className={`min-h-screen flex flex-col gap-2 dark:bg-gray-900`}>
                        <h1 className={` flex-0`}>Markdown Editor</h1>
                        <div className="flex flex-1 w-full gap-4">
                            <Editor
                                initialDoc={doc}
                                onChange={handleDocChange}
                            />
                            <Preview doc={doc} />
                        </div>
                    </main>
                </div>
            </AppLayout>
        )
    } else {
        return (
            <div>
                {error && <div>Error: {error.message}</div>}
                Loading...
            </div>
        )
    }
}
