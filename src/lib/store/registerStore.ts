import { writable } from 'svelte/store';

import type { UserRegister } from '$lib/interfaces/user.interface';

export const registerData = writable<UserRegister>({});
