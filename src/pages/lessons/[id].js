import AppLayout from "@/components/Layouts/AppLayout";
import Head from "next/head";
import axios from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import YoutubeIFrame from "@/components/YoutubeIFrame";
import ReactMarkdown from "react-markdown";

const Course = () => {
    const [lesson, setLesson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const router = useRouter();
    const { id } = router.query
    const getLink = path => `${router.basePath}${path}`
    const fetchCourse = async () => {
        if (!id) return
        try {
            const response = await axios.get("/lessons/" + id);
            setLesson(response.data.data);
        } catch (error) {
            setError(error);
        }
        setLoading(false);
    }
    useEffect(() => {
        fetchCourse();
    }, [id]);

    function onNext(data) {
        if (data) {
            console.log(data);
        }
        const input = document.getElementById("input");
        if (input) {
            input.value = "";
        }
        if (page < lesson.contents.length - 1) {
            setPage(page + 1);
        } else {
            router.push(`/courses/${lesson.course.id}`);
        }
    }

    const content = lesson && lesson.contents[page];
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {lesson && lesson.name} -{" "}
                    {lesson && lesson.contents[page].name}
                </h2>
            }>
            <Head>
                <title>Laravel - Dashboard</title>
            </Head>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {content && (
                <div
                    className="mt-24 text-center divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:divide-y-0 flex flex-col justify-between xl:px-72 md:px-24 sm:px-12 px-4">
                    {content.type === "content" && (
                        <article>
                            <ReactMarkdown>{content.text}</ReactMarkdown>
                        </article>
                    )}
                    {content.type === "attachment" && (
                        <a href={content.text} target="_blank" rel="noreferrer">
                            {content.text}
                        </a>
                    )}
                    {content.type === "video" && (
                        <YoutubeIFrame videoId={content.video_id} />
                    )}
                    {content.type === "quiz" && (
                        <ReactMarkdown>{content.text}</ReactMarkdown>
                    )}
                    {content.is_true_false && (
                        <div className="flex justify-center xl:mt-8 mt-4">
                            <button
                                onClick={() =>
                                    onNext({
                                        type: "quiz-true-false",
                                        quiz_id: content.id,
                                        answer_id: 1
                                    })
                                }
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
                                True
                            </button>
                            <button
                                onClick={() =>
                                    onNext({
                                        type: "quiz-true-false",
                                        quiz_id: content.id,
                                        answer_id: 0
                                    })
                                }
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                False
                            </button>
                        </div>
                    )}
                    {content.is_multiple_choice && (
                        <div
                            className="flex justify-center xl:mt-8 mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
                            {content.choices.map((answer, index) => (
                                <button
                                    key={index}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 xl:mt-8 mt-4 mr-4"
                                    onClick={() => {
                                        onNext({
                                            type: "quiz-multiple-choice",
                                            quiz_id: content.id,
                                            answer_id: answer.id
                                        });
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
                                if (content.type === "quiz") {
                                    const answer = document.getElementById(
                                        "input"
                                    );
                                    const text = answer.value;
                                    if (!text) return;
                                    onNext({
                                        type: "quiz-fill-in-the-blank",
                                        quiz_id: content.id,
                                        answer: text
                                    });
                                } else {
                                    onNext();
                                }
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded xl:mt-8 mt-4">
                            {page === lesson.contents.length - 1
                                ? "Finish"
                                : "Next"}
                        </button>
                    )}
                </div>
            )}
        </AppLayout>
    )
}

export default Course
