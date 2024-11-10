import { expect, test } from 'vitest';
import { apiBuffer, apiJson, apiText } from '../../src/helpers/api';

const API_URL: string = 'https://jsonplaceholder.typicode.com/todos/1';
const API_TEXT: string = `{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}`;
const API_JSON: object = {
  userId: 1,
  id: 1,
  title: 'delectus aut autem',
  completed: false,
};
const API_BUFFER: ArrayBuffer = new Uint16Array([
  123, 10, 32, 32, 34, 117, 115, 101, 114, 73, 100, 34, 58, 32, 49, 44, 10, 32, 32, 34, 105, 100, 34, 58, 32, 49, 44,
  10, 32, 32, 34, 116, 105, 116, 108, 101, 34, 58, 32, 34, 100, 101, 108, 101, 99, 116, 117, 115, 32, 97, 117, 116, 32,
  97, 117, 116, 101, 109, 34, 44, 10, 32, 32, 34, 99, 111, 109, 112, 108, 101, 116, 101, 100, 34, 58, 32, 102, 97, 108,
  115, 101, 10, 125,
]).buffer;

test('Get plain text', async () => {
  expect(await apiText(API_URL)).toEqual(API_TEXT);
});

test('Get json', async () => {
  expect(await apiJson(API_URL)).toEqual(API_JSON);
});

test('Get raw buffer', async () => {
  expect(await apiBuffer(API_URL)).toEqual(API_BUFFER);
});
