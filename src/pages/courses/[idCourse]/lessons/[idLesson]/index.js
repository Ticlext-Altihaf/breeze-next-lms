import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import axios from '@/lib/axios'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import YoutubeIFrame from '@/components/YoutubeIFrame'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import '@uiw/react-markdown-preview/markdown.css'
import dynamic from 'next/dynamic'
import rehypeSanitize from 'rehype-sanitize'
import mermaid from 'mermaid'
import katex from 'katex'
import 'katex/dist/katex.css'

const MD = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false })

const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36)

const CodeKatex = ({ inline, children = [], className, ...props }) => {
    const txt = children[0] || ''
    if (inline) {
        if (typeof txt === 'string' && /^\$\$(.*)\$\$/.test(txt)) {
            const html = katex.renderToString(
                txt.replace(/^\$\$(.*)\$\$/, '$1'),
                {
                    throwOnError: false,
                },
            )
            return <code dangerouslySetInnerHTML={{ __html: html }} />
        }
        return <code>{txt}</code>
    }
    if (
        typeof txt === 'string' &&
        typeof className === 'string' &&
        /^language-katex/.test(className.toLocaleLowerCase())
    ) {
        const html = katex.renderToString(txt, {
            throwOnError: false,
        })
        console.log('props', txt, className, props)
        return <code dangerouslySetInnerHTML={{ __html: html }} />
    }
    return null
}

const Code = ({ inline, children = [], className, ...props }) => {
    const katex = CodeKatex({ inline, children, className, ...props })
    if (katex) {
        console.log('katex', katex)
        return katex
    }
    const demoid = useRef(`dome${randomid()}`)
    const code = getCode(children)
    const demo = useRef(null)
    useEffect(() => {
        if (demo.current) {
            try {
                // @ts-ignore
                demo.current.innerHTML = mermaid.render(
                    demoid.current,
                    code,
                    () => null,
                    demo.current,
                )
            } catch (error) {
                // @ts-ignore
                demo.current.innerHTML = error
            }
        }
    }, [code, demo])

    if (
        typeof code === 'string' &&
        typeof className === 'string' &&
        /^language-mermaid/.test(className.toLocaleLowerCase())
    ) {
        return (
            <code ref={demo}>
                <code id={demoid.current} style={{ display: 'none' }} />
            </code>
        )
    }
    return <code className={String(className)}>{children}</code>
}

const getCode = (arr = []) =>
    arr
        .map(dt => {
            if (typeof dt === 'string') {
                return dt
            }
            if (dt.props && dt.props.children) {
                return getCode(dt.props.children)
            }
            return false
        })
        .filter(Boolean)
        .join('')

const Course = () => {
    const [lesson, setLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(0)
    const router = useRouter()
    const { idLesson, idCourse } = router.query
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

    function onNext(data) {
        if (data) {
            console.log(data)
        }
        const input = document.getElementById('input')
        if (input) {
            input.value = ''
        }
        if (page < lesson.contents.length - 1) {
            setPage(page + 1)
        } else {
            router.push(`/courses/${lesson.course.id}`)
        }
    }

    const content = lesson && lesson.contents[page]
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight flex justify-between">
                    {lesson && lesson.name}
                    {content && ' - ' + lesson.contents[page].name}
                    <Link
                        href={`/courses/${idCourse}/lessons/${idLesson}/create`}
                        passHref={true}
                        className="font-semibold text-xl text-gray-800 leading-tight">
                        Add content
                    </Link>
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
            {content && (
                <div className="mt-24 text-center divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0 flex flex-col justify-between xl:px-72 md:px-24 sm:px-12 px-4">
                    {content.type === 'content' && (
                        <MD
                            rehypePlugins={[rehypeSanitize]}
                            components={{
                                code: Code,
                            }}
                            source={content.text}
                            className="bg-white dark:bg-gray-800 m-8"
                        />
                    )}
                    {content.type === 'attachment' && (
                        <a href={content.text} target="_blank" rel="noreferrer">
                            {content.text}
                        </a>
                    )}
                    {content.type === 'video' && (
                        <YoutubeIFrame videoId={content.video_id} />
                    )}
                    {content.type === 'quiz' && (
                        <ReactMarkdown>{content.text}</ReactMarkdown>
                    )}
                    {content.is_true_false && (
                        <div className="flex justify-center xl:mt-8 mt-4">
                            <button
                                onClick={() =>
                                    onNext({
                                        type: 'quiz-true-false',
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
                                        type: 'quiz-true-false',
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
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 xl:mt-8 mt-4 mr-4"
                                    onClick={() => {
                                        onNext({
                                            type: 'quiz-multiple-choice',
                                            quiz_id: content.id,
                                            answer_id: answer.id,
                                        })
                                    }}>
                                    <ReactMarkdown>{answer.text}</ReactMarkdown>
                                </button>
                            ))}
                        </div>
                    )}
                    {content.is_fill_in_the_blank && (
                        <div className="flex justify-center xl:mt-8 mt-4 screen">
                            <input
                                className="border border-gray-300 rounded-md shadow-sm"
                                id="input"
                                name="answer"
                                type="text"
                            />
                        </div>
                    )}
                    {!content.is_multiple_choice && !content.is_true_false && (
                        <button
                            onClick={() => {
                                if (content.type === 'quiz') {
                                    const answer = document.getElementById(
                                        'input',
                                    )
                                    const text = answer.value
                                    if (!text) return
                                    onNext({
                                        type: 'quiz-fill-in-the-blank',
                                        quiz_id: content.id,
                                        answer: text,
                                    })
                                } else {
                                    onNext()
                                }
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded xl:mt-8 mt-4">
                            {page === lesson.contents.length - 1
                                ? 'Finish'
                                : 'Next'}
                        </button>
                    )}
                </div>
            )}
        </AppLayout>
    )
}

export default Course
