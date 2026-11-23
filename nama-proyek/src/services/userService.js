import { httpClient } from "./httpClient";

export const getUsers = (params) => httpClient.get('/users', params);
export const createUser = (data) => httpClient.post('/users', data);
export const updateUser = (id, data) => httpClient.patch(`/users/${id}`, data);
export const deleteUser = (id) => httpClient.delete(`/users/${id}`);
