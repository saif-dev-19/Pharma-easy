import api from "./axios";

export const getTransfers = async (params = {}) => {
    const response = await api.get("/transfers/", { params });
    return response.data;
};

export const getTransfer = async (id) => {
    const response = await api.get(`/transfers/${id}/`);
    return response.data;
};

export const createTransfer = async (data) => {
    const response = await api.post("/transfers/", data);
    return response.data;
};