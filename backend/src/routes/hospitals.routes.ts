import { Router } from 'express';

import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { DepartmentsService } from '../services/departments.service.js';
import { HospitalRequisitesService } from '../services/hospital-requisites.service.js';
import { HospitalsService } from '../services/hospitals.service.js';
import {
  departmentCreateSchema,
  departmentListQuerySchema,
  departmentUpdateSchema,
  hospitalCreateSchema,
  hospitalListQuerySchema,
  hospitalRequisitesUpsertSchema,
  hospitalUpdateSchema,
  idParamSchema,
} from '../validation.js';

const service = new HospitalsService(pool);
const requisitesService = new HospitalRequisitesService(pool);
const departmentsService = new DepartmentsService(pool);
export const hospitalsRouter = Router();

hospitalsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = hospitalListQuerySchema.parse(req.query);
    const result = await service.list(query);
    res.json(result);
  }),
);

hospitalsRouter.get(
  '/:id/requisites',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await requisitesService.getByHospitalId(id);
    res.json(item);
  }),
);

hospitalsRouter.put(
  '/:id/requisites',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = hospitalRequisitesUpsertSchema.parse(req.body);
    const item = await requisitesService.upsert(id, body);
    res.json(item);
  }),
);

hospitalsRouter.get(
  '/:id/departments',
  asyncHandler(async (req, res) => {
    const { id: hospitalId } = idParamSchema.parse(req.params);
    const query = departmentListQuerySchema.parse(req.query);
    const result = await departmentsService.listByHospital(hospitalId, query);
    res.json(result);
  }),
);

hospitalsRouter.get(
  '/:id/departments/:departmentId',
  asyncHandler(async (req, res) => {
    const { id: hospitalId } = idParamSchema.parse(req.params);
    const { id: departmentId } = idParamSchema.parse({ id: req.params.departmentId });
    const item = await departmentsService.getById(hospitalId, departmentId);
    res.json(item);
  }),
);

hospitalsRouter.post(
  '/:id/departments',
  asyncHandler(async (req, res) => {
    const { id: hospitalId } = idParamSchema.parse(req.params);
    const body = departmentCreateSchema.parse(req.body);
    const item = await departmentsService.create(hospitalId, body);
    res.status(201).json(item);
  }),
);

hospitalsRouter.put(
  '/:id/departments/:departmentId',
  asyncHandler(async (req, res) => {
    const { id: hospitalId } = idParamSchema.parse(req.params);
    const { id: departmentId } = idParamSchema.parse({ id: req.params.departmentId });
    const body = departmentUpdateSchema.parse(req.body);
    const item = await departmentsService.update(hospitalId, departmentId, body);
    res.json(item);
  }),
);

hospitalsRouter.patch(
  '/:id/departments/:departmentId',
  asyncHandler(async (req, res) => {
    const { id: hospitalId } = idParamSchema.parse(req.params);
    const { id: departmentId } = idParamSchema.parse({ id: req.params.departmentId });
    const body = departmentUpdateSchema.parse(req.body);
    const item = await departmentsService.update(hospitalId, departmentId, body);
    res.json(item);
  }),
);

hospitalsRouter.delete(
  '/:id/departments/:departmentId',
  asyncHandler(async (req, res) => {
    const { id: hospitalId } = idParamSchema.parse(req.params);
    const { id: departmentId } = idParamSchema.parse({ id: req.params.departmentId });
    await departmentsService.remove(hospitalId, departmentId);
    res.status(204).send();
  }),
);

hospitalsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await service.getById(id);
    res.json(item);
  }),
);

hospitalsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = hospitalCreateSchema.parse(req.body);
    const item = await service.create(body);
    res.status(201).json(item);
  }),
);

hospitalsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = hospitalUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

hospitalsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = hospitalUpdateSchema.parse(req.body);
    const item = await service.update(id, body);
    res.json(item);
  }),
);

hospitalsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await service.remove(id);
    res.status(204).send();
  }),
);
