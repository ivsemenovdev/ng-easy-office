import { Router } from 'express';

import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { CountriesService } from '../services/countries.service.js';
import {
  countryCreateSchema,
  countryListQuerySchema,
  countryUpdateSchema,
  idParamSchema,
} from '../validation.js';

const service = new CountriesService(pool);
export const countriesRouter = Router();

countriesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = countryListQuerySchema.parse(req.query);
    const result = await service.list(query);
    res.json(result);
  }),
);

countriesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await service.getById(id);
    res.json(item);
  }),
);

countriesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = countryCreateSchema.parse(req.body);
    const item = await service.create(body);
    res.status(201).json(item);
  }),
);

countriesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = countryUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

countriesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = countryUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

countriesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await service.remove(id);
    res.status(204).send();
  }),
);
