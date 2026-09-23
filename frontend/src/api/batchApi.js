import api from "./axios";

export const getBatches = async (params = {}) => {
    const response = await api.get("/batches/", {
        params,
    });

    return response.data;
};

export const getBatch = async (id) => {
    const response = await api.get(`/batches/${id}/`);

    return response.data;
};

export const getBatchQR = async (id) => {
    const response = await api.get(`/batches/${id}/qr/`, {
        responseType: "blob",
    });

    return response.data;
};