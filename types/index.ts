// This file will contain shared TypeScript interfaces
// that will be used across both frontend and API routes

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}