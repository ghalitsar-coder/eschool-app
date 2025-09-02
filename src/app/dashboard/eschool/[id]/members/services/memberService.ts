import { Member, ApiResponse } from '../../types'
import apiClient from '@/lib/axios'

// Fetch members of an eschool
export const fetchEschoolMembers = async (eschoolId: number): Promise<Member[]> => {
  const response = await apiClient.get<ApiResponse<Member[]>>(`/api/eschools/${eschoolId}/members`)
  return response.data.data
}

// Add member to eschool
export const addMemberToEschool = async ({ eschoolId, memberId }: { eschoolId: number, memberId: number }): Promise<Member> => {
  const response = await apiClient.post<ApiResponse<Member>>(`/api/eschools/${eschoolId}/members`, { member_id: memberId })
  return response.data.data
}

// Remove member from eschool
export const removeMemberFromEschool = async ({ eschoolId, memberId }: { eschoolId: number, memberId: number }): Promise<void> => {
  await apiClient.delete(`/api/eschools/${eschoolId}/members/${memberId}`)
}