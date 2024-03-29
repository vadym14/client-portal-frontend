import type {Variables} from '$lib/interfaces/variables.interface';

const BASE_API_URI: string = import.meta.env.DEV ? import.meta.env.VITE_BASE_API_URI_DEV : import.meta.env.VITE_BASE_API_URI_PROD
const API_KEY: string = import.meta.env.DEV ? import.meta.env.VITE_API_KEY_DEV : import.meta.env.VITE_API_KEY_PROD
const API_SECRET: string = import.meta.env.DEV ? import.meta.env.VITE_API_SECRET_DEV : import.meta.env.VITE_API_SECRET_PROD
export const variables: Variables = {
    BASE_API_URI: BASE_API_URI,
    API_KEY: API_KEY,
    API_SECRET: API_SECRET
};

//'http://localhost:8000/api' //'https://django-sveltekit-jwt-auth.herokuapp.com/api'
