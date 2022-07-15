import adapter from '@sveltejs/adapter-node';
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],
	kit: {
		adapter: adapter(),
		vite: {
			optimizeDeps: {
				include: ['just-throttle', 'dayjs']
			}
		},
		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['POST','PUT','PATCH', 'DELETE']
		}
	}
};

export default config;
