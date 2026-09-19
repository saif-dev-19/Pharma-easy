import api from "./axios";

export const getPurchases = async (params = {}) => {
    const response = await api.get("/purchases/", {
        params,
    });

    return response.data;
};

export const getPurchase = async (id) => {
    const response = await api.get(`/purchases/${id}/`);
    return response.data;
};

export const createPurchase = async (data) => {
    const response = await api.post("/purchases/", data);
    return response.data;
};

export const updatePurchase = async (id, data) => {
    const response = await api.put(`/purchases/${id}/`, data);
    return response.data;
};

export const deletePurchase = async (id) => {
    await api.delete(`/purchases/${id}/`);
};