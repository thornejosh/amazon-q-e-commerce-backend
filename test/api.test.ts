import axios from 'axios';

const API_ENDPOINT = 'https://s1xwcx9o8b.execute-api.eu-west-1.amazonaws.com/prod';

describe('API Integration tests', () => {
  let createdItemId: string;

  test('POST new item', async () => {
    const newItem = { name: 'Test Item', price: 10 };
    const response = await axios.post(`${API_ENDPOINT}/items`, newItem);
    expect(response.status).toBe(201);
    expect(response.data).toMatchObject(newItem);
    createdItemId = response.data.id;
  });

  test('GET all items', async () => {
    const response = await axios.get(`${API_ENDPOINT}/items`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('GET single item', async () => {
    const response = await axios.get(`${API_ENDPOINT}/items/${createdItemId}`);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(createdItemId);
  });

  test('PUT update item', async () => {
    const updatedItem = { name: 'Updated Test Item', price: 15 };
    const response = await axios.put(`${API_ENDPOINT}/items/${createdItemId}`, updatedItem);
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(updatedItem);
  });

  test('DELETE item', async () => {
    const response = await axios.delete(`${API_ENDPOINT}/items/${createdItemId}`);
    expect(response.status).toBe(204);
  });

  test('GET deleted item (should fail)', async () => {
    try {
      await axios.get(`${API_ENDPOINT}/items/${createdItemId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (axios.isAxiosError(error) && error.response) {
          if (axios.isAxiosError(error) && error.response) {
            expect(error.response.status).toBe(404);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  });

  test('POST invalid item (should fail)', async () => {
    const invalidItem = { invalid: 'data' };
    try {
      await axios.post(`${API_ENDPOINT}/items`, invalidItem);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect(error.response.status).toBe(400);
      } else {
        throw error;
      }
    }
  });

  test('PUT with invalid data (should fail)', async () => {
    const invalidUpdate = { price: 'not a number' };
    try {
      await axios.put(`${API_ENDPOINT}/items/${createdItemId}`, invalidUpdate);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect(error.response.status).toBe(400);
      } else {
        throw error;
      }
    }
  });

  test('GET non-existent item (should fail)', async () => {
    try {
      await axios.get(`${API_ENDPOINT}/items/non-existent-id`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        expect(error.response.status).toBe(400);
      } else {
        throw error;
      }
    }
  });
});