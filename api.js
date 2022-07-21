const async = require('hbs/lib/async');
const request = require('request-promise');

async function api_call(full_url, at) {
	const requestOptions = {
		uri: full_url,
		headers: {
			'Authorization': `Bearer ${at}`
		},
		json: true
	};
	const data = await request(requestOptions);
	return data;
}

async function getUser(accessToken) {
	let url = 'https://api.pipedrive.com/v1/users/me';
	return api_call(url, accessToken);
}
async function getDeals(accessToken) {
	let url = 'https://api.pipedrive.com/v1/deals';
	return api_call(url, accessToken);
}

async function getDeal(accessToken, id) {
	let url = 'https://api.pipedrive.com/v1/deals/' + id;
	return api_call(url, accessToken);
}

async function getDealFields(accessToken) {
	let url = 'https://api.pipedrive.com/v1/dealFields';
	return api_call(url, accessToken);
}

async function getDealProducts(accessToken, id) {
	url = 'https://api.pipedrive.com/v1/deals/' + id + '/products';
	return api_call(url, accessToken);
}

module.exports = {
	getUser,
	getDeals,
	getDeal,
	getDealProducts,
	getDealFields
};