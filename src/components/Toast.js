const Toast = ({ type = 'button', className, ...props }) => (
    <button
        type="button"
        className={`fixed top-4 right-4 z-50 ${className} ${
            props.color === 'success'
                ? 'bg-green-500'
                : props.color === 'error'
                ? 'bg-red-500'
                : ''
        } text-white font-bold rounded-lg px-4 py-3 shadow-lg`}
        style={{
            display: props.show ? 'block' : 'none',
        }}
        aria-label="Close"
        {...props}>
        <div className="flex items-center space-x-2">
            <span className="text-3xl">
                <i className="bx bx-check" />
            </span>
            <p className="font-bold">{props.message}</p>
        </div>
    </button>
)

export default Toast
