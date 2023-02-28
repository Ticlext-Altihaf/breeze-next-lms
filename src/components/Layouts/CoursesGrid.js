import Image from 'next/image'

const CoursesGrid = ({ courses }) => {
    return (
        <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5  text-gray-800 dark:text-gray-100">
            {courses.map(course => (
                <div className="w-full p-4" key={course.id}>
                    <a
                        href={`/courses/${course.id}`}
                        className="c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden dark:bg-gray-800">
                        <div className="relative pb-48 overflow-hidden">
                            <img
                                className="absolute inset-0 h-full w-full object-cover"
                                src={course.image_url}
                                alt=""
                            />
                        </div>
                        <div className="p-4 border-b">
                            <span
                                className="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs"
                                style={{ display: 'none' }}>
                                Highlight
                            </span>
                            <h2 className="mt-2 mb-2 text-lg font-bold">
                                {course.name}
                            </h2>
                            <p className="text-sm">{course.description}</p>
                        </div>
                        {course.categories.length > 0 && (
                            <div className="p-4 border-b text-xs">
                                {course.categories.map(category => (
                                    <span
                                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 dark:bg-gray-700 dark:text-gray-200"
                                        key={category.id}>
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="p-4 flex items-center text-sm">
                            <div className="flex items-center">
                                <img
                                    className="w-8 h-8 rounded-full mr-4"
                                    src={
                                        course.author?.image_url ||
                                        'https://loremflickr.com/500/500/face?random=EM1OvbuF5lYbokyA'
                                    }
                                    alt="Avatar of Author"
                                />
                                <div className="text-left">
                                    <p className="text-black dark:text-white">
                                        {course.author?.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            ))}
        </div>
    )
}

export default CoursesGrid
