const BASE_URL = 'https://api.example.com';

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(${BASE_URL});
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(${BASE_URL}, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};
