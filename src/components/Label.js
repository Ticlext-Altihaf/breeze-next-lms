const Label = ({ className, children, ...props }) => (
    <label
        className={`${className} block font-medium text-sm text-gray-700 dark:text-gray-400`}
        {...props}>
        {children}
    </label>
)

export default Label
