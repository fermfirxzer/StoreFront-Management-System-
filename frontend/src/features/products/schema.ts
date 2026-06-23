import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or fewer."),
  description: z.string().optional(),
  unitPrice: z.number().positive("Must be greater than 0"),
  quantity: z.number().int("Must be a whole number").min(0, "Must be greater than or equal to 0"),
  image: z.instanceof(File).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
