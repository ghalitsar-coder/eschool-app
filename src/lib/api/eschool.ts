import { ApiResponse, Eschool } from "@/types/api";
import apiClient from "./client";

// Fetch all eschools
// Note: jangan gunakan Promise ApiResponse .. Cukup type Eschool nya saja... karna return dari backend tidak di bundle dengan attibute/property lain, hanya mengembalikan Eschool 
export const fetchEschools = async (): Promise<Eschool[]> => {

  const response = await apiClient.get<Eschool[]>("/eschools");
  // NOTE : JANGAN DIBUAT response.data.data.. karna return dibackend tidak memiliki property data jadi hanya 1 saja response.data instead response.data,data
  return response.data || [];
};

// Fetch single eschool
// Note: jangan gunakan Promise ApiResponse .. Cukup type Eschool nya saja... karna return dari backend tidak di bundle dengan attibute/property lain, hanya mengembalikan Eschool 
export const fetchEschool = async (id: number): Promise<Eschool> => {

  const response = await apiClient.get<Eschool>(`/eschools/${id}`);
  // NOTE : JANGAN DIBUAT response.data.data.. karna return dibackend tidak memiliki property data jadi hanya 1 saja response.data instead response.data,data
  return response.data;
};

// Create new eschool
// Note: jangan gunakan Promise ApiResponse .. Cukup type Eschool nya saja... karna return dari backend tidak di bundle dengan attibute/property lain, hanya mengembalikan Eschool 
export const createEschool = async (data: any): Promise<Eschool> => {

  const response = await apiClient.post<Eschool>(
    "/eschools",
    data
  );
  // NOTE : JANGAN DIBUAT response.data.data.. karna return dibackend tidak memiliki property data jadi hanya 1 saja response.data instead response.data,data
  return response.data;
};

// Update eschool
export const updateEschool = async ({
  id,
  data,
}: {
  id: number;
  data: any;
  // Note: jangan gunakan Promise ApiResponse .. Cukup type Eschool nya saja... karna return dari backend tidak di bundle dengan attibute/property lain, hanya mengembalikan Eschool 
}): Promise<Eschool> => {

  const response = await apiClient.put<Eschool>(
    `/eschools/${id}`,
    data
  );
  // NOTE : JANGAN DIBUAT response.data.data.. karna return dibackend tidak memiliki property data jadi hanya 1 saja response.data instead response.data,data
  return response.data;
};

// Delete eschool
// Note: jangan gunakan Promise ApiResponse .. Cukup type Eschool nya saja... karna return dari backend tidak di bundle dengan attibute/property lain, hanya mengembalikan Eschool 
export const deleteEschool = async (id: number): Promise<void> => {

  await apiClient.delete(`/eschools/${id}`);
};
