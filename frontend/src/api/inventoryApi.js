import api from "./axios";

export const getInventory = async (params = {}) => {
    const response = await api.get("/inventory/", {
        params,
    });

    return response.data;
};

export const getInventoryItem = async (id) => {
    const response = await api.get(`/inventory/${id}/`);

    return response.data;
};

export const getLowStock = async () => {
    const response = await api.get("/inventory/low_stock/");

    return response.data;
};

export const getExpiredStock = async () => {
    const response = await api.get("/inventory/expired/");

    return response.data;
};