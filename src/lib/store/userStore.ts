import { writable } from 'svelte/store';
import {browser} from "$app/env";

import type { User } from '$lib/interfaces/user.interface';

export const userData = writable<User>({});


const storedData = JSON.parse(browser && localStorage.getItem('user') || '{}');

export const userData1 = writable(browser && storedData);

userData1.subscribe( (val) => browser && (localStorage.user = JSON.stringify(val))); // save to local storage for persistence;
