import axios from "axios";

const URL_BASE = import.meta.env.VITE_API_BASE_URL || "/paseoapi/v1";
let csrfToken = "";

export const clienteApi = axios.create({
    baseURL: URL_BASE,
    withCredentials: true,
    withXSRFToken: false,
    headers: {
        'Content-Type': 'application/json',
    },
});

clienteApi.interceptors.request.use(async (config) => {
    if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
        if (!csrfToken) await prepararSolicitudSegura();
        config.headers["X-XSRF-TOKEN"] = csrfToken;
    }
    return config;
});

export async function prepararSolicitudSegura() {
    const respuesta = await clienteApi.get("/auth/csrf");
    csrfToken = respuesta.data.token;
    return csrfToken;
}