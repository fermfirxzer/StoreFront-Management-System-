import { z } from "zod";

export const MAX_PRODUCT_PRICE = 10_000_000;
export const MAX_PRODUCT_QUANTITY = 999_999;
export const MAX_PRODUCT_TITLE_LENGTH = 75;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;

export const productSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(MAX_PRODUCT_TITLE_LENGTH, `Title must be ${MAX_PRODUCT_TITLE_LENGTH} characters or fewer.`),
  description: z
    .string()
    .max(
      MAX_PRODUCT_DESCRIPTION_LENGTH,
      `Description must be ${MAX_PRODUCT_DESCRIPTION_LENGTH} characters or fewer.`
    )
    .optional(),
  unitPrice: z
    .number()
    .positive("Must be greater than 0")
    .max(MAX_PRODUCT_PRICE, "Price must be 10,000,000 THB or less."),
  quantity: z
    .number()
    .int("Must be a whole number")
    .min(0, "Must be greater than or equal to 0")
    .max(MAX_PRODUCT_QUANTITY, "Quantity must be 999,999 or less."),
  image: z.instanceof(File).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
