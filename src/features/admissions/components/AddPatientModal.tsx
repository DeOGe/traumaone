import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../supabaseClient'; // Assuming supabaseClient.ts is in the same directory or adjust path

// Shadcn UI Components
import { Button } from '../../../components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from 'date-fns';

// Define the Zod schema for new patient form validation
const newPatientFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  birthdate: z.date({
    required_error: 'A birthdate is required.',
  }),
  sex: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Please select a sex.',
  }),
  hospital_registration_number: z.string().nullable().optional(),
});

// Props for the AddPatientModal component
interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  // CHANGED: Pass the full patient object
  onPatientAdded: (newPatient: { id: string; first_name: string; last_name: string; hospital_registration_number: string | null; }) => void;
}

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }: AddPatientModalProps) {
  const form = useForm<z.infer<typeof newPatientFormSchema>>({
    resolver: zodResolver(newPatientFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      birthdate: new Date(),
      sex: 'Male', // Default sex
      hospital_registration_number: null, // CHANGED: Default to null
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Handle new patient submission
  async function onSubmit(values: z.infer<typeof newPatientFormSchema>) {
    setLoading(true);
    setError(null);
    try {
      const hospitalRegNum = values.hospital_registration_number === '' ? null : values.hospital_registration_number;

      const { data, error: supabaseError } = await supabase
        .from('patients')
        .insert({
          first_name: values.first_name,
          last_name: values.last_name,
          birthdate: values.birthdate.toISOString().split('T')[0],
          sex: values.sex,
          hospital_registration_number: hospitalRegNum,
        })
        .select('id, first_name, last_name, hospital_registration_number') // Make sure to select all relevant fields
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        // CHANGED: Pass the full data object
        onPatientAdded(data);
        form.reset();
        onClose();
      }
    } catch (err: any) {
      console.error('Error adding new patient:', err);
      setError(err.message || 'Failed to add new patient.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Patient</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name */}
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Patient's first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Patient's last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birthdate */}
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birthdate</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sex */}
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hospital Registration Number */}
            <FormField
              control={form.control}
              name="hospital_registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital Registration #</FormLabel>
                  <FormControl>
                    {/* Ensure the input correctly handles null by converting it to empty string for display */}
                    <Input
                      placeholder="Optional"
                      {...field}
                      value={field.value ?? ''} // Convert null to empty string for the input field
                    />
                  </FormControl>
                  <FormDescription>
                    Unique identifier from the hospital.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Patient'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}