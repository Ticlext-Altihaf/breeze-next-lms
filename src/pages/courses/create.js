import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import AppLayout from '@/components/Layouts/AppLayout'
import Link from 'next/link'
import Head from 'next/head'

const Tag = props => <span className="tag" {...props} />
const Delete = props => <button className="delete" {...props} />
const Help = props => <span className="help" {...props} />

export default function CreateCourse() {
    const { user } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    if (user && !user.is_teacher && !user.is_admin) {
        router.push('/') //Major L
    }
    const [error, setError] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [errors, setErrors] = useState([])
    useEffect(() => {
        axios.get('/categories').then(res => {
            setCategories(res.data.data)
        })
    }, [])
    const suggestions = categories.map(category => {
        const data = { id: category.id + '', name: category.name }
        return data
    })

    const getLink = path => `${router.basePath}${path}`
    // drag state
    const [dragActive, setDragActive] = useState(false)

    // handle drag events
    const handleDrag = function (e) {
        e.preventDefault()
        e.stopPropagation()
        console.log(e.type)
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
        if (e.type === 'drop') {
            setDragActive(false)
            const files = e.dataTransfer.files
            if (files.length > 0) {
                setSelectedFile(files[0])
            }
        }
    }

    function handleFile(e) {
        if (e.target.files.length === 0) return
        setSelectedFile(e.target.files[0])
    }

    function handleChange(e) {
        console.log(e.target.value)
    }

    function handleKeyDown(e) {
        if (e.keyCode === 13 && e.target.value !== '') {
            let newTag = e.target.value
            if (tags.indexOf(newTag) === -1) {
                console.log(newTag)
                const newTags = [...tags, newTag]
                setTags(newTags)
                console.log(tags)
            }
            e.target.value = ''
        }
    }

    function handleRemoveTag(e) {
        let tag = e.target.parentNode.textContent.trim()
        let index = tags.indexOf(tag)
        if (index !== -1) {
            setTags([...tags.slice(0, index), ...tags.slice(index + 1)])
            console.log(tag)
        }
    }

    function handleSubmit(e) {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', e.target.name.value)
        formData.append('description', e.target.description.value)
        for (let i = 0; i < tags.length; i++) {
            formData.append('categories[]', tags[i])
        }
        formData.append('image', selectedFile)
        setErrors([])
        axios
            .post('/courses', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(res => {
                console.log(res.data)
                router.push('/teacher')
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
    }

    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight flex justify-between">
                    Teacher - Create Course
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
                        <div className="rounded-t bg-white mb-0 px-6 py-6">
                            <div className="text-center flex justify-between">
                                <h6 className="text-blueGray-700 text-xl font-bold">
                                    Create Course
                                </h6>
                            </div>
                        </div>
                        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                            <form onSubmit={handleSubmit}>
                                <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                                    User Information
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
                                                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                name={'name'}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-6/12 px-4">
                                        <div className="relative w-full mb-3">
                                            <label
                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                htmlFor="grid-password">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                name={'description'}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="w-full lg:w-6/12 px-4"
                                        hidden={true}>
                                        <div className="relative w-full mb-3">
                                            <label
                                                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                htmlFor="grid-password">
                                                Last Name
                                            </label>
                                            <div className="tags-input">
                                                {tags.map((tag, index) => (
                                                    <Tag key={index}>
                                                        {tag}
                                                        <Delete
                                                            onClick={
                                                                handleRemoveTag
                                                            }
                                                        />
                                                    </Tag>
                                                ))}
                                                <input
                                                    type="text"
                                                    onChange={handleChange}
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="w-full lg:w-6/12 px-4"
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrag}>
                                        <div className="relative w-full mb-3">
                                            <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                                                Image
                                            </label>
                                        </div>
                                        <label
                                            className={
                                                'flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none' +
                                                (dragActive
                                                    ? ' border-blue-500'
                                                    : '')
                                            }>
                                            <span className="flex items-center space-x-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-6 h-6 text-gray-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                                {selectedFile ? (
                                                    <span className="font-medium text-gray-600">
                                                        {selectedFile.name}
                                                    </span>
                                                ) : (
                                                    <span className="font-medium text-gray-600">
                                                        {
                                                            'Drop files to Attach, or '
                                                        }
                                                        <span className="text-blue-600 underline">
                                                            browse
                                                        </span>
                                                    </span>
                                                )}
                                            </span>
                                            <input
                                                type="file"
                                                name="file_upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFile}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <hr className="mt-6 border-b-1 border-blueGray-300" />
                                <div className="flex justify-end">
                                    <button
                                        className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
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
