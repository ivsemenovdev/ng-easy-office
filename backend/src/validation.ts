import { z } from 'zod';

const isoAlpha2 = z
  .string()
  .length(2)
  .transform((s) => s.toUpperCase());

const isoAlpha3 = z
  .string()
  .length(3)
  .transform((s) => s.toUpperCase())
  .optional()
  .nullable();

const pagination = {
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
};

export const countryCreateSchema = z.object({
  iso_alpha2: isoAlpha2,
  iso_alpha3: isoAlpha3,
  name_ru: z.string().min(1),
  name_en: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const countryUpdateSchema = countryCreateSchema.partial();

export const countryListQuerySchema = z.object({
  ...pagination,
  is_active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const regionLevelSchema = z.enum([
  'country',
  'federal_subject',
  'administrative',
]);

export const regionCreateSchema = z.object({
  country_id: z.number().int().positive(),
  parent_id: z.number().int().positive().nullable().optional(),
  level: regionLevelSchema,
  code: z.string().min(1).max(20),
  okato: z.string().max(11).nullable().optional(),
  name_ru: z.string().min(1),
  name_short_ru: z.string().nullable().optional(),
  name_en: z.string().nullable().optional(),
  region_type: z.string().max(50).nullable().optional(),
  sort_order: z.number().int().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const regionUpdateSchema = regionCreateSchema.partial();

export const regionListQuerySchema = z.object({
  ...pagination,
  country_id: z.coerce.number().int().positive().optional(),
  country_iso: z
    .string()
    .length(2)
    .transform((s) => s.toUpperCase())
    .optional(),
  parent_id: z.coerce.number().int().positive().optional(),
  level: regionLevelSchema.optional(),
  is_active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const hospitalCreateSchema = z.object({
  region_id: z.number().int().positive(),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const hospitalUpdateSchema = hospitalCreateSchema.partial();

export const hospitalListQuerySchema = z.object({
  ...pagination,
  region_id: z.coerce.number().int().positive().optional(),
  is_active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

const nullableString = z.string().nullable().optional();

const emptyToNull = (value: string | null | undefined) => {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
};

const optionalRequisiteString = z
  .string()
  .nullable()
  .optional()
  .transform(emptyToNull);

const optionalDigits = (lengths: number[]) =>
  optionalRequisiteString.refine(
    (value) => value === undefined || value === null || lengths.includes(value.length),
    { message: `Must be ${lengths.join(' or ')} digits` },
  ).refine(
    (value) => value === undefined || value === null || /^\d+$/.test(value),
    { message: 'Must contain digits only' },
  );

export const hospitalRequisitesUpsertSchema = z.object({
  legal_address: optionalRequisiteString,
  postal_address: optionalRequisiteString,
  phone: optionalRequisiteString,
  inn: optionalDigits([10, 12]),
  kpp: optionalDigits([9]),
  ogrn: optionalDigits([13, 15]),
  bank_account: optionalRequisiteString,
  bik: optionalDigits([9]),
  bank_name: optionalRequisiteString,
  ktm: optionalRequisiteString,
  okpo: optionalRequisiteString,
  email: optionalRequisiteString,
});

export const equipmentTypeCreateSchema = z.object({
  name: z.string().min(1),
  is_active: z.boolean().optional().default(true),
});

export const equipmentTypeUpdateSchema = equipmentTypeCreateSchema.partial();

export const equipmentTypeListQuerySchema = z.object({
  ...pagination,
  is_active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const departmentCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().max(20).nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const departmentUpdateSchema = departmentCreateSchema.partial();

export const departmentListQuerySchema = z.object({
  ...pagination,
  is_active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const hospitalIdParamSchema = z.object({
  hospitalId: z.coerce.number().int().positive(),
});

export const departmentIdParamSchema = z.object({
  departmentId: z.coerce.number().int().positive(),
});

export const hospitalDepartmentIdParamSchema = hospitalIdParamSchema.extend({
  id: z.coerce.number().int().positive(),
});

export const departmentEquipmentIdParamSchema = departmentIdParamSchema.extend({
  id: z.coerce.number().int().positive(),
});

export const equipmentCreateSchema = z.object({
  equipment_type_id: z.number().int().positive(),
  name: z.string().min(1),
  manufacturer: nullableString,
  model: nullableString,
  serial_number: z.string().max(50).nullable().optional(),
  inventory_number: z.string().max(50).nullable().optional(),
  manufacture_year: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .nullable()
    .optional(),
  is_active: z.boolean().optional().default(true),
});

export const equipmentUpdateSchema = equipmentCreateSchema.partial();

export const equipmentListQuerySchema = z.object({
  ...pagination,
  is_active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const diagnosticActCreateSchema = z.object({
  hospital_id: z.number().int().positive(),
  act_number: nullableString,
  act_date: nullableString,
  act_title: nullableString,
  equipment_name: nullableString,
  equipment_model: nullableString,
  serial_number: nullableString,
  customer: nullableString,
  customer_address: nullableString,
  work_type: nullableString,
  basis: nullableString,
  equipment_condition: z.array(z.string()).optional().default([]),
  completed_works: z.array(z.string()).optional().default([]),
  conclusion: z.array(z.string()).optional().default([]),
});

export const diagnosticActListQuerySchema = z.object({
  ...pagination,
  hospital_id: z.coerce.number().int().positive(),
});
