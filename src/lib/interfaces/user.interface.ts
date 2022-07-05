export interface Token {
	refresh?: string;
	access?: string;
}

export interface UserRegister {
	accountNo?: string;
	dob?: string;
	ssn?: string;
	fullName?: string;
	email?: string;
	phoneNo?: string;
	phoneType?: string;
	street?: string;
	city?: string;
	state?: string;
	code?: string;
	offer?: number;
}
export interface User {
	id?: string;
	email?: string;
	username?: string;
	password?: string;
	tokens?: Token;
	bio?: string;
	full_name?: string;
	birth_date?: string;
	is_staff?: boolean;
}

export interface UserResponse {
	user?: User;
}
