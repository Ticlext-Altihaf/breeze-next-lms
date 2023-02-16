import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'

import CreateContent from '@/pages/courses/[idCourse]/lessons/[idLesson]/create'

import axios from '@/lib/axios'
import Link from 'next/link'
import AppLayout from '@/components/Layouts/AppLayout'
import Editor from '@/components/Markdown/Editor'
import Preview from '@/components/Markdown/Preview'
import Dropdown from '@/components/Dropdown'
import { DropdownButton } from '@/components/DropdownLink'
export default function EditContent() {
    const router = useRouter()
    const { page, idLesson, idCourse } = router.query
    const [content, setContent] = useState(null)
    const [error, setError] = useState(null)
    const [doc, setDoc] = useState(content?.content || '# Loading')

    const handleDocChange = useCallback(newDoc => {
        setDoc(newDoc)
    }, [])

    useEffect(() => {
        if (page) {
            axios
                .get(`/lessons/${idLesson}`)
                .then(res => {
                    if (res.data.data.contents) {
                        const content = res.data.data.contents.find(content => {
                            return content.order_no === parseInt(page)
                        })
                        if (!content) {
                            router.push(
                                `/courses/${idCourse}/lessons/${idLesson}`,
                            )
                        }
                        if (content.type === 'content') {
                            setDoc(content.text)
                        }
                        setContent(content)
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
    }, [page])
    if (content) {
        let saveContent = e => {
            e.preventDefault()
            axios
                .put(`/contents/${content.id}`, {
                    text: doc,
                })
                .then(res => {
                    console.log(res)
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
        let deleteContent = e => {
            e.preventDefault()
            axios
                .delete(`/contents/${content.id}`)
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
        const isQuiz = content.type === 'quiz'
        return (
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl leading-tight flex justify-between">
                        Giga
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
                                        if (content.content !== doc) {
                                            if (
                                                !confirm(
                                                    'You have unsaved changes. Are you sure you want to leave?',
                                                )
                                            ) {
                                                return
                                            }
                                        }
                                        router.push(
                                            `/courses/${idCourse}/lessons/${idLesson}`,
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
