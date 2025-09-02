import { useState } from 'react'

interface RoleFormProps {
  role: 'coordinator' | 'treasurer'
  currentUserId: number | null | undefined
  onSubmit: (userId: number | null) => void
  onCancel: () => void
  isSubmitting: boolean
}

export default function RoleForm({ role, currentUserId, onSubmit, onCancel, isSubmitting }: RoleFormProps) {
  const [userId, setUserId] = useState<string>(currentUserId?.toString() || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!userId) {
      newErrors.userId = 'ID pengguna wajib diisi'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    onSubmit(userId ? parseInt(userId) : null)
  }

  const roleName = role === 'coordinator' ? 'Koordinator' : 'Bendahara'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentUserId ? `Ubah ${roleName}` : `Tentukan ${roleName}`}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                ID Pengguna *
              </label>
              <input
                type="number"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.userId ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={`Masukkan ID pengguna sebagai ${roleName.toLowerCase()}`}
              />
              {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId}</p>}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}