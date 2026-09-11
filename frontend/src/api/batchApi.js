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

export const createBatch = async (data) => {
    const response = await api.post("/batches/", data);

    return response.data;
};

export const updateBatch = async (id, data) => {
    const response = await api.put(`/batches/${id}/`, data);

    return response.data;
};

export const deleteBatch = async (id) => {
    await api.delete(`/batches/${id}/`);
};

export const getBatchQR = async (id) => {
    const response = await api.get(`/batches/${id}/qr/`, {
        responseType: "blob",
    });

    return response.data;
};