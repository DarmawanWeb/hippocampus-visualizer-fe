'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuthContext } from '@/components/provider/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { AuthRequest } from '@/types/auth';

const formSchema = z
  .object({
    email: z.string().email({ message: 'Enter a valid email address' }),
    name: z.string().min(1, { message: 'Name is required' }).optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
  })
  .refine((data) => data.name !== undefined || data.name === undefined, {
    message: 'Name is required',
    path: ['name'],
  });

type UserFormValue = z.infer<typeof formSchema>;

interface UserAuthFormProps {
  type: 'signup' | 'login';
}

export default function UserAuthForm({ type }: UserAuthFormProps) {
  const { isLoading, login, register: signupUser } = useAuthContext();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: type === 'signup' ? '' : undefined,
      password: '',
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    const payload: AuthRequest = {
      email: data.email,
      password: data.password,
      ...(type === 'signup' && { name: data.name }),
    };

    if (type === 'signup') {
      await signupUser(payload);
    } else {
      await login(payload);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {type === 'signup' && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Your email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Your password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isLoading} className="w-full" type="submit">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {type === 'signup' ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : type === 'signup' ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  );
}
