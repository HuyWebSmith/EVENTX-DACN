import axios from "axios";

export const getAll = () => axios.get("/categories");
export const create = (data) => axios.post("/categories", data);
export const update = (id, data) => axios.put(`/categories/${id}`, data);
export const remove = (id) => axios.delete(`/categories/${id}`);
