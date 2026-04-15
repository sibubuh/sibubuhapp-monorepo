import { STRAPI_CMS_BASE_URL, STRAPI_CMS_TOKEN } from "../config/strapi";

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
	const authToken = STRAPI_CMS_TOKEN;
	const baseURL = STRAPI_CMS_BASE_URL;

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${authToken}`,
		...(options.headers || {}),
	};

	const config: RequestInit = {
		...options,
		headers,
	};
	console.log(`Fetching: ${baseURL}${endpoint}`);
	const response = await fetch(`${baseURL}${endpoint}`, config);

	if (!response.ok) {
		if (import.meta.env.NODE_ENV === "development") {
			const error = await response.json();
			// eslint-disable-next-line no-console
			console.log(`${baseURL}${endpoint}:`, error);
		}
		return null;
	}
	return await response.json();
};

export default fetchWithAuth;
