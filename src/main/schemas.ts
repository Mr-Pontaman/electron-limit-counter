import { z } from "zod";

export const itemNameSchema = z.string().trim().min(1).max(20);
export const limitSchema = z.number().int().min(0).max(3000);

export const itemSchema = z.object({
  itemName: itemNameSchema
});
