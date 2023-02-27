const Input = ({ disabled = false, className, ...props }) => (
    <input
        disabled={disabled}
        className={`${className} rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:focus:ring-gray-700 block w-full sm:text-sm border-gray-300 dark:bg-gray-700`}
        {...props}
    />
)

export default Input
