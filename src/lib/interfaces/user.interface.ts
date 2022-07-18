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

export interface UserInfo {
	register:{
		name?: string;
		date_of_birth?: string;
		ssn?: string;
	},
	customer: {
		doctype?: string,
		name?: string,
		customer_name?: string,
		customer_primary_address?: string,
		customer_primary_contact?: string
	},
	contact: {
		doctype: string,
		name?: string,
		first_name?: string,
		last_name?: string,
		email_id?: string ,
		phone?: string
	},
	address: {
		doctype?: string,
		name?: string ,
		address_line1?: string ,
		city?: string ,
		state?: string ,
		phone?: string,
		email_id?:string,
		pincode?: string
	},
	user: {
		doctype?: string,
		name?: string ,
		first_name?: string ,
		last_name?: string ,
		email?: string ,
		new_password?: string
	},
	project: {
		doctype?:string,
		name?:string,
		original_creditor?:string,
		creditor_account_number?:string,
		account_open?:string,
		charge_off_date?:string,
		unadjusted_amount?:string,
		plan_1?:string,
		plan_2?:string,
		plan_3?:string,
		plan_4?:string,
		plan_5?:string,
	}
}

export interface UserResponse {
	user?: User;
}
