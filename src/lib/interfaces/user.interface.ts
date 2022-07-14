export interface Token {
	refresh?: string;
	access?: string;
}

export interface UserRegister {
	//acc_name?: string;
	name?: string;
	first_name?: string;
	last_name?: string;
	date_of_birth?: string;
	ssn?: string;
	customer_name?: string;
	email_id?: string;
	phone?: string;
	phone_type?: string;
	address_line1?: string;
	city?: string;
	state?: string;
	pincode?: string;
	password?: string;
	customer_primary_address?: string;
	customer_primary_contact?: string;
	//offer?: number;
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
