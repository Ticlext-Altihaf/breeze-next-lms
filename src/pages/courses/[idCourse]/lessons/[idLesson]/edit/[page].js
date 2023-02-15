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
        return (
            <AppLayout
                header={
                    <h2 className="font-semibold text-xl leading-tight flex justify-between">
                        Giga
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
