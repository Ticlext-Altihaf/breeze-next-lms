import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LessonRedirectWithPage() {
    const router = useRouter()
    const { idLesson, idCourse } = router.query
    if (idLesson && idCourse) {
        router.push(`/courses/${idCourse}/lessons/${idLesson}/1`)
    }
    return (
        <div>
            <h1>Redirecting...</h1>
            <Link href={`/courses/${idCourse}/lessons/${idLesson}/1`} />
        </div>
    )
}
