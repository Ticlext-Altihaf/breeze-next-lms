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
function getToken() {
    if (localStorage.getItem('token')) {
        return localStorage.getItem('token')
    }
    if (sessionStorage.getItem('token')) {
        return sessionStorage.getItem('token')
    }
}

export function setToken(token, remember) {
    if (!token) {
        return
    }
    if (remember) {
        localStorage.setItem('token', token)
    } else {
        sessionStorage.setItem('token', token)
    }
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}

export function removeToken() {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
}

if (!ISSERVER) {
    const token = getToken()
    if (token) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    }
}
export default axios
