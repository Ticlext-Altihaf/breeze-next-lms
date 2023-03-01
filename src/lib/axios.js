import Axios from 'axios'
const ISSERVER = typeof window === 'undefined'

if (!ISSERVER && !localStorage.getItem('lang')) {
    localStorage.setItem('lang', 'en')
}
const lang = ISSERVER ? 'en' : localStorage.getItem('lang')
let params = {}
if (process.env.NODE_ENV === 'development') {
    params['XDEBUG_SESSION_START'] = 'PHPSTORM'
}
const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Accept-Language': lang,
    },
    params: params,
    withCredentials: true,
})

export default axios
