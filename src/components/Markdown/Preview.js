import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
    ghcolors,
    vscDarkPlus,
} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import 'github-markdown-css/github-markdown.css'
import ReactMarkdown from 'react-markdown'
import CopyBtn from './copy-btn'
import styles from '@/styles/react-markdown.module.css'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkMermaid from 'remark-mermaidjs'
const Preview = props => {
    const { theme, resolvedTheme, forcedTheme } = useTheme()
    console.log(theme, resolvedTheme, forcedTheme)
    return (
        <div className="w-1/2 preview markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath, remarkMermaid]}
                rehypePlugins={[rehypeKatex]}

                className={styles.reactMarkDown}
                components={{
                    pre({ node, ...props }) {
                        return <pre {...props} />
                    },
                    code({
                        node,
                        inline,
                        className,
                        children,
                        style,
                        ...props
                    }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <CopyBtn codeText={String(children)}>
                                <SyntaxHighlighter
                                    style={
                                        resolvedTheme === 'dark'
                                            ? vscDarkPlus
                                            : ghcolors
                                    }
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}>
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </CopyBtn>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    },
                }}>
                {props.doc}
            </ReactMarkdown>
        </div>
    )
}

export default Preview
