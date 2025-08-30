'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, Trash2 } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth';

interface Member {
  id: string;
  name: string;
}

interface Payment {
  member_id: string;
  amount: string;
  month: string;
  year: string;
}

interface IncomeForm {
  description: string;
  date: string;
  payments: Payment[];
}

interface IncomeDialogProps {
  showIncomeDialog: boolean;
  setShowIncomeDialog: (open: boolean) => void;
}

const IncomeDialog = ({ showIncomeDialog, setShowIncomeDialog }: IncomeDialogProps) => {
  const { user } = useAuthStore();
  const role = user?.role;
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isAddingIncome, setIsAddingIncome] = useState(false);

  const incomeForm = useForm<IncomeForm>({
    defaultValues: {
      description: '',
      date: new Date().toISOString().split('T')[0],
      payments: [{ member_id: '', amount: '', month: '', year: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: incomeForm.control,
    name: 'payments',
  });

  useEffect(() => {
    if (role !== 'bendahara') {
      setShowIncomeDialog(false);
      return;
    }
    const fetchMembers = async () => {
      try {
        setIsLoadingMembers(true);
        const response = await apiClient.get('/members');
        setMembers(response.data);
      } catch (err) {
        incomeForm.setError('root', { message: 'Gagal memuat data member' });
      } finally {
        setIsLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [role, setShowIncomeDialog]);

  const handleAddIncome = async (data: IncomeForm) => {
    setIsAddingIncome(true);
    try {
      await apiClient.post('/kas/income', data);
      incomeForm.reset();
      setShowIncomeDialog(false);
      alert('Pemasukan berhasil dicatat!');
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      incomeForm.setError('root', {
        message: errors ? Object.values(errors).flat().join(', ') : err.response?.data?.message || 'Gagal mencatat pemasukan',
      });
    } finally {
      setIsAddingIncome(false);
    }
  };

  return (
    <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Add Income
          </DialogTitle>
          <DialogDescription>
            Record a new income transaction for multiple members.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...incomeForm}>
          <form onSubmit={incomeForm.handleSubmit(handleAddIncome)} className="space-y-4">
            <FormField
              control={incomeForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly dues, donation, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={incomeForm.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <h3 className="text-lg font-semibold mb-2">Payments</h3>
              {incomeForm.formState.errors.root && (
                <p className="text-red-500 text-sm mb-2">{incomeForm.formState.errors.root.message}</p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Member</th>
                      <th className="border p-2 text-left">Amount (Rp)</th>
                      <th className="border p-2 text-left">Month</th>
                      <th className="border p-2 text-left">Year</th>
                      <th className="border p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id}>
                        <td className="border p-2">
                          <FormField
                            control={incomeForm.control}
                            name={`payments.${index}.member_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={isLoadingMembers ? 'Loading members...' : 'Select a member'}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {members.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                          {member.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="border p-2">
                          <FormField
                            control={incomeForm.control}
                            name={`payments.${index}.amount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="border p-2">
                          <FormField
                            control={incomeForm.control}
                            name={`payments.${index}.month`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" placeholder="1-12" min="1" max="12" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="border p-2">
                          <FormField
                            control={incomeForm.control}
                            name={`payments.${index}.year`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" placeholder="2025" min="2020" max="2100" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="border p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ member_id: '', amount: '', month: '', year: '' })}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowIncomeDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAddingIncome}
                className="bg-green-600 hover:bg-green-700"
              >
                {isAddingIncome ? 'Adding...' : 'Add Income'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default IncomeDialog;