import React, { useCallback, useEffect } from 'react'
import { EditorState } from '@codemirror/state'
import useCodeMirror from './use-codemirror'

const Editor = props => {
    const { onChange, initialDoc } = props
    const handleChange = useCallback(state => onChange(state.doc.toString()), [
        onChange,
    ])
    const [refContainer, editorView] = useCodeMirror({
        initialDoc,
        onChange: handleChange,
    })

    useEffect(() => {
        if (editorView) {
            // Do nothing for now
        } else {
            // loading editor
        }
    }, [editorView])

    return (
        <div
            className="w-1/2 h-full flex-grow-0 flex-shrink-0"
            ref={refContainer}
        />
    )
}

export default Editor
