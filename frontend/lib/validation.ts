import { z } from 'zod';

/**
 * Profile creation/update validation schema
 */
export const profileSchema = z.object({
    bio: z
        .string()
        .min(20, 'Bio must be at least 20 characters')
        .max(500, 'Bio must be less than 500 characters')
        .trim(),
    age: z
        .number()
        .min(18, 'You must be at least 18 years old')
        .max(100, 'Please enter a valid age'),
    interests: z
        .array(z.string().min(1))
        .min(1, 'Add at least one interest')
        .max(10, 'Maximum 10 interests allowed'),
    location: z
        .string()
        .min(2, 'Location is required')
        .max(100, 'Location too long')
        .trim(),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .trim(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Message validation schema
 */
export const messageSchema = z.object({
    message: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(1000, 'Message too long (max 1000 characters)')
        .trim(),
});

export type MessageFormData = z.infer<typeof messageSchema>;

/**
 * Funding validation schema
 */
export const fundingSchema = z.object({
    amount: z
        .number()
        .min(0.001, 'Minimum funding is 0.001 ETH')
        .max(10, 'Maximum funding is 10 ETH'),
});

export type FundingFormData = z.infer<typeof fundingSchema>;
