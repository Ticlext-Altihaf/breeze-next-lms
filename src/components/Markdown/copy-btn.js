import React, { SyntheticEvent, useState } from 'react'
import { MdOutlineContentCopy } from 'react-icons/md'

const CopyBtn = ({ children, codeText }) => {
    const handleClick = e => {
        navigator.clipboard.writeText(codeText)
    }

    return (
        <div>
            <span className="text-white absolute right-2 top-1 hover:cursor-pointer transition hover:scale-150">
                <MdOutlineContentCopy onClick={handleClick} />
            </span>
            {children}
        </div>
    )
}

export default CopyBtn
