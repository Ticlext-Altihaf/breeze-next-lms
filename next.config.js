const removeImports = require('next-remove-imports')()
module.exports = {
    ...removeImports,
    images: {
        unoptimized: true,
    },
}
