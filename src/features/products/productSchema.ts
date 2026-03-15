import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().optional(),
  categoryId: z.number().int().min(1, 'Selecciona una categoría'),
  brandId: z.number().int().min(1, 'Selecciona una marca'),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  minStock: z.number().int().min(0).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().optional(),
  categoryId: z.number().int().min(1, 'Selecciona una categoría'),
  brandId: z.number().int().min(1, 'Selecciona una marca'),
  minStock: z.number().int().min(0).optional(),
});

export const updatePriceSchema = z.object({
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  reason: z.string().optional(),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
export type UpdatePriceFormValues = z.infer<typeof updatePriceSchema>;
