const removeImports = require('next-remove-imports')()
module.exports = {
    ...removeImports,
    images: {
        unoptimized: true,
    },
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
}
