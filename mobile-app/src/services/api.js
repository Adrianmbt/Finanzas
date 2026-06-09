import { API_BASE_URL } from '../config';

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error(
          `No se pudo conectar al servidor.\n` +
          `Verifica que:\n` +
          `1. El backend esté corriendo (uvicorn main:app --host 0.0.0.0 --port 8000)\n` +
          `2. La IP en src/config.js sea correcta (actual: ${this.baseUrl})\n` +
          `3. Tu celular esté en la misma red WiFi que tu computadora`
        );
      }
      throw error;
    }
  }

  // --- Categorías ---
  async getCategorias() {
    return this.request('/categorias/');
  }

  async crearCategoria(data) {
    return this.request('/categorias/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Transacciones ---
  async getTransacciones() {
    return this.request('/transacciones/');
  }

  async crearTransaccion(data) {
    return this.request('/transacciones/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Exportar una instancia singleton
export const api = new ApiService(API_BASE_URL);
