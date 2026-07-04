/**
 * Development environment.
 * apiBaseUrl must point at the FastAPI backend (see e-commerce_backend/app/core/config.py
 * -> API_V1_PREFIX = "/api/v1"). Do NOT append /api/v1 here again — each service
 * appends it via ApiEndpoints so it stays in one place.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api/v1'
};
