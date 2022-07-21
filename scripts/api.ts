import axios from 'axios';
import { FileResponse, ImageResponse } from './types';

const API_URL = 'https://api.figma.com';
const API_VERSION = 'v1';
const BASE_URL = `${API_URL}/${API_VERSION}`;

const {
  FIGMA_TOKEN = '',
  FIGMA_FILE_KEY = '',
  FIGMA_NODE_ID = '',
} = process.env;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-Figma-Token': FIGMA_TOKEN },
});

export const getFile = async (): Promise<FileResponse> => {
  const { data } = await api.get<FileResponse>(`/files/${FIGMA_FILE_KEY}`, {
    params: { ids: decodeURIComponent(FIGMA_NODE_ID) },
  });
  return data;
};

export const getImages = async (ids: string) => {
  const { data } = await api.get<ImageResponse>(`/images/${FIGMA_FILE_KEY}`, {
    params: { ids, format: 'svg' },
  });
  return data.images;
};

export const getSVG = async (url: string) => {
  const { data } = await axios.get<string>(url);
  return data;
};
