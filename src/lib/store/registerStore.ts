import { writable } from 'svelte/store';

import type { UserRegister } from '$lib/interfaces/user.interface';
import {browser} from "$app/env";

//export const registerData = writable<UserRegister>({});


const storedData = JSON.parse(browser && localStorage.getItem('register') || '{}');

export const registerData = writable<UserRegister>(browser && storedData);

registerData.subscribe( (val) => browser && (localStorage.register = JSON.stringify(val))); // save to local storage for persistence;
