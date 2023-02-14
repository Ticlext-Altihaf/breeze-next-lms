import Axios from 'axios'

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
    params: {
        XDEBUG_SESSION_START: 'PHPSTORM',
    },
    withCredentials: true,
})

export default axios
