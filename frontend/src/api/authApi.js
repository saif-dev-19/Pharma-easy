import api from "./axios";

export const loginUser = async (username, password) => {
    const response = await api.post("/login/", {
        username,
        password,
    });

    return response.data;
};