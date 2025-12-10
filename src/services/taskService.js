import axiosClient from '../api/axiosClient';

const taskService = {
    async createTask(inputText) {
        const response = await axiosClient.post('/api/tasks', { inputText });
        return response.data;
    },

    async getTasks() {
        const response = await axiosClient.get('/api/tasks');
        return response.data;
    },

    async getTask(id) {
        const response = await axiosClient.get(`/api/tasks/${id}`);
        return response.data;
    },

    async updateTask(id, data) {
        const response = await axiosClient.put(`/api/tasks/${id}`, data);
        return response.data;
    },

    async deleteTask(id) {
        const response = await axiosClient.delete(`/api/tasks/${id}`);
        return response.data;
    },
};

export default taskService;
