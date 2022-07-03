import { writable } from 'svelte/store';

import type { Register } from '$lib/interfaces/user.interface';

export const registerData = writable<Register>({});
