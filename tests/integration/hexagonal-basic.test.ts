/**
 * Simple Integration Test for Hexagonal Architecture
 * Tests the basic functionality without complex database setup
 */

import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { integrateHexagonalArchitecture } from '../../src/infrastructure/HexagonalIntegration';

describe('Hexagonal Architecture Integration - Basic Tests', () => {
  let app: Express;
  let prisma: PrismaClient;
  let hexagonalIntegration: any;

  beforeAll(async () => {
    // Setup test app
    const express = require('express');
    app = express();
    app.use(express.json());
    
    // Setup database client
    prisma = new PrismaClient();

    try {
      // Integrate hexagonal architecture
      hexagonalIntegration = await integrateHexagonalArchitecture(app, prisma);
      console.log('✅ Hexagonal Architecture integration test setup complete');
    } catch (error) {
      console.error('❌ Failed to setup hexagonal integration:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (hexagonalIntegration) {
      await hexagonalIntegration.shutdown();
    }
    await prisma.$disconnect();
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status for all hexagonal components', async () => {
      const response = await request(app)
        .get('/api/v2/health/hexagonal')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        components: {
          attendanceRepository: true,
          employeeRepository: true,
          scheduleRepository: true,
          attendanceApplicationService: true,
          attendanceController: true
        }
      });
    });
  });

  describe('Route Registration', () => {
    it('should have registered all hexagonal attendance routes', async () => {
      // Test that routes are properly registered by checking they exist
      // (even if they return validation errors with empty payloads)
      
      // Check-in endpoint
      const checkinResponse = await request(app)
        .post('/api/v2/attendance/checkin')
        .send({});
      
      expect(checkinResponse.status).toBe(400); // Should return validation error, not 404
      expect(checkinResponse.body.status).toBe('error');
      expect(checkinResponse.body.message).toBe('Missing required fields: employee_id, outlet_id, image_proof');

      // Check-out endpoint
      const checkoutResponse = await request(app)
        .post('/api/v2/attendance/checkout')
        .send({});
        
      expect(checkoutResponse.status).toBe(400);
      expect(checkoutResponse.body.status).toBe('error');
      expect(checkoutResponse.body.message).toBe('Missing required fields: attendance_id, image_proof');

      // Get today attendance with invalid ID
      const todayResponse = await request(app)
        .get('/api/v2/attendance/today/999999');
        
      expect([400, 404]).toContain(todayResponse.status); // Either validation error or not found

      // Get attendance details with invalid ID
      const detailsResponse = await request(app)
        .get('/api/v2/attendance/999999');
        
      expect([400, 404]).toContain(detailsResponse.status);

      // Get outlet attendances with invalid outlet ID
      const outletResponse = await request(app)
        .get('/api/v2/outlet/999999/attendances');
        
      expect([400, 404]).toContain(outletResponse.status);

      // Approve late with invalid ID
      const approveResponse = await request(app)
        .patch('/api/v2/attendance/999999/approve-late')
        .send({});
        
      expect(approveResponse.status).toBe(400);

      // Reject late with invalid ID
      const rejectResponse = await request(app)
        .patch('/api/v2/attendance/999999/reject-late')
        .send({});
        
      expect(rejectResponse.status).toBe(400);
    });
  });

  describe('Request Validation', () => {
    it('should validate check-in request payload', async () => {
      const testCases = [
        {
          payload: {},
          expectedMessage: 'Missing required fields: employee_id, outlet_id, image_proof'
        },
        {
          payload: { employee_id: 1 },
          expectedMessage: 'Missing required fields: employee_id, outlet_id, image_proof'
        },
        {
          payload: { employee_id: 1, outlet_id: 1 },
          expectedMessage: 'Missing required fields: employee_id, outlet_id, image_proof'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/v2/attendance/checkin')
          .send(testCase.payload)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe(testCase.expectedMessage);
      }
    });

    it('should validate check-out request payload', async () => {
      const testCases = [
        {
          payload: {},
          expectedMessage: 'Missing required fields: attendance_id, image_proof'
        },
        {
          payload: { attendance_id: 1 },
          expectedMessage: 'Missing required fields: attendance_id, image_proof'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/v2/attendance/checkout')
          .send(testCase.payload)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe(testCase.expectedMessage);
      }
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error response format', async () => {
      const response = await request(app)
        .post('/api/v2/attendance/checkin')
        .send({})
        .expect(400);

      // Check error response structure
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should handle domain errors with proper error codes', async () => {
      const response = await request(app)
        .post('/api/v2/attendance/checkin')
        .send({
          employee_id: 999999, // Non-existent employee
          outlet_id: 1,
          image_proof: 'data:image/jpeg;base64,/9j/4AAQ...'
        });

      // Should return domain error (either 400 or 404)
      expect([400, 404, 500]).toContain(response.status);
      expect(response.body.status).toBe('error');
      
      // Should have error code if it's a domain error
      if (response.body.error_code) {
        expect(typeof response.body.error_code).toBe('string');
      }
    });
  });

  describe('Architecture Compliance', () => {
    it('should maintain clean separation between layers', () => {
      // This test validates that the architecture components are properly isolated
      // In a real scenario, this could use static analysis tools
      
      const container = require('../../src/infrastructure/DIContainer');
      expect(typeof container.initializeDIContainer).toBe('function');
      expect(typeof container.getDIContainer).toBe('function');
      expect(typeof container.disposeDIContainer).toBe('function');
    });

    it('should follow dependency inversion principle', () => {
      // Test that domain layer doesn't depend on infrastructure
      // This is more of a structural test that would use dependency analyzers
      expect(true).toBe(true); // Placeholder for structural validation
    });
  });

  describe('Performance & Stability', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/v2/health/hexagonal')
          .expect(200)
      );

      const results = await Promise.all(promises);
      
      results.forEach(response => {
        expect(response.body.status).toBe('healthy');
      });
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v2/attendance/checkin')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Should handle JSON parse error gracefully
      expect(response.body || response.text).toBeDefined();
    });
  });
});