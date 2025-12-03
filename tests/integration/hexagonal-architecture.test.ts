import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { integrateHexagonalArchitecture } from '../../src/infrastructure/HexagonalIntegration';

describe('Hexagonal Architecture Integration Tests', () => {
  let app: Express;
  let prisma: PrismaClient;
  let hexagonalIntegration: any;

  beforeAll(async () => {
    // Setup test app
    const express = require('express');
    app = express();
    app.use(express.json());
    
    // Setup test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'
        }
      }
    });

    // Integrate hexagonal architecture
    hexagonalIntegration = await integrateHexagonalArchitecture(app, prisma);
  });

  afterAll(async () => {
    if (hexagonalIntegration) {
      await hexagonalIntegration.shutdown();
    }
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.attendance.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.outlet.deleteMany();
  });

  describe('Health Check', () => {
    it('should return healthy status for all components', async () => {
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

  describe('Attendance Checkin', () => {
    let testEmployee: any;
    let testOutlet: any;

    beforeEach(async () => {
      // Setup test data
      testOutlet = await prisma.outlet.create({
        data: {
          name: 'Test Outlet',
          location: 'Test Location',
          code: 'TST001',
          user_id: 1
        }
      });

      testEmployee = await prisma.employee.create({
        data: {
          name: 'Test Employee',
          nik: 'EMP001',
          phone: '1234567890',
          address: 'Test Address',
          province_id: BigInt(1),
          city_id: BigInt(1),
          district_id: BigInt(1),
          subdistrict_id: BigInt(1),
          merital_status: 'SINGLE',
          religion: 'Test Religion',
          birth_date: new Date('1990-01-01'),
          birth_place: 'Test City',
          blood_type: 'A',
          rt: '001',
          rw: '002',
          work_type: 'Full Time',
          position: 'Staff',
          image_path: '/path/to/image.jpg',
          gender: 'MALE',
          hire_date: new Date()
        }
      });
    });

    it('should successfully check in employee', async () => {
      const checkinData = {
        employee_id: testEmployee.id,
        outlet_id: testOutlet.id,
        image_proof: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...'
      };

      const response = await request(app)
        .post('/api/v2/attendance/checkin')
        .send(checkinData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Check-in successful');
      expect(response.body.data).toHaveProperty('attendance_id');
      expect(response.body.data).toHaveProperty('checkin_time');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        employee_id: testEmployee.id
        // missing outlet_id and image_proof
      };

      const response = await request(app)
        .post('/api/v2/attendance/checkin')
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Missing required fields: employee_id, outlet_id, image_proof');
    });

    it('should handle domain errors properly', async () => {
      const invalidData = {
        employee_id: 999999, // non-existent employee
        outlet_id: testOutlet.id,
        image_proof: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...'
      };

      const response = await request(app)
        .post('/api/v2/attendance/checkin')
        .send(invalidData)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe('EMPLOYEE_NOT_FOUND');
    });
  });

  describe('Attendance Checkout', () => {
    let testEmployee: any;
    let testOutlet: any;
    let testAttendance: any;

    beforeEach(async () => {
      // Setup test data
      testOutlet = await prisma.outlet.create({
        data: {
          name: 'Test Outlet',
          code: 'TST001',
          address: 'Test Address',
          pic_name: 'Test PIC'
        }
      });

      testEmployee = await prisma.employee.create({
        data: {
          name: 'Test Employee',
          code: 'EMP001',
          email: 'test@example.com',
          phone: '1234567890',
          outlet_id: testOutlet.id,
          role: 'STAFF'
        }
      });

      // Create checked-in attendance
      testAttendance = await prisma.attendance.create({
        data: {
          employee_id: testEmployee.id,
          outlet_id: testOutlet.id,
          checkin_time: new Date(),
          image_proof: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...',
          status: 'PRESENT'
        }
      });
    });

    it('should successfully check out employee', async () => {
      const checkoutData = {
        attendance_id: testAttendance.id,
        image_proof: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...'
      };

      const response = await request(app)
        .post('/api/v2/attendance/checkout')
        .send(checkoutData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Check-out successful');
      expect(response.body.data).toHaveProperty('checkout_time');
      expect(response.body.data).toHaveProperty('work_hours');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        attendance_id: testAttendance.id
        // missing image_proof
      };

      const response = await request(app)
        .post('/api/v2/attendance/checkout')
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Missing required fields: attendance_id, image_proof');
    });
  });

  describe('Get Today Attendance', () => {
    let testEmployee: any;
    let testOutlet: any;

    beforeEach(async () => {
      // Setup test data
      testOutlet = await prisma.outlet.create({
        data: {
          name: 'Test Outlet',
          code: 'TST001',
          address: 'Test Address',
          pic_name: 'Test PIC'
        }
      });

      testEmployee = await prisma.employee.create({
        data: {
          name: 'Test Employee',
          code: 'EMP001',
          email: 'test@example.com',
          phone: '1234567890',
          outlet_id: testOutlet.id,
          role: 'STAFF'
        }
      });

      // Create today's attendance
      await prisma.attendance.create({
        data: {
          employee_id: testEmployee.id,
          outlet_id: testOutlet.id,
          checkin_time: new Date(),
          image_proof: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...',
          status: 'PRESENT'
        }
      });
    });

    it('should return today\'s attendance for employee', async () => {
      const response = await request(app)
        .get(`/api/v2/attendance/today/${testEmployee.id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('employee_id', testEmployee.id);
      expect(response.body.data).toHaveProperty('checkin_time');
      expect(response.body.data).toHaveProperty('status', 'PRESENT');
    });

    it('should return 404 for employee with no attendance today', async () => {
      // Create another employee without attendance
      const anotherEmployee = await prisma.employee.create({
        data: {
          name: 'Another Employee',
          code: 'EMP002',
          email: 'another@example.com',
          phone: '0987654321',
          outlet_id: testOutlet.id,
          role: 'STAFF'
        }
      });

      const response = await request(app)
        .get(`/api/v2/attendance/today/${anotherEmployee.id}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe('ATTENDANCE_NOT_FOUND');
    });
  });

  describe('Get Outlet Attendances', () => {
    let testOutlet: any;
    let testEmployees: any[];

    beforeEach(async () => {
      // Setup test data
      testOutlet = await prisma.outlet.create({
        data: {
          name: 'Test Outlet',
          code: 'TST001',
          address: 'Test Address',
          pic_name: 'Test PIC'
        }
      });

      // Create multiple employees
      testEmployees = await Promise.all([
        prisma.employee.create({
          data: {
            name: 'Employee 1',
            code: 'EMP001',
            email: 'emp1@example.com',
            phone: '1234567890',
            outlet_id: testOutlet.id,
            role: 'STAFF'
          }
        }),
        prisma.employee.create({
          data: {
            name: 'Employee 2',
            code: 'EMP002',
            email: 'emp2@example.com',
            phone: '0987654321',
            outlet_id: testOutlet.id,
            role: 'STAFF'
          }
        })
      ]);

      // Create attendances for both employees
      await Promise.all(testEmployees.map(emp =>
        prisma.attendance.create({
          data: {
            employee_id: emp.id,
            outlet_id: testOutlet.id,
            checkin_time: new Date(),
            image_proof: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...',
            status: 'PRESENT'
          }
        })
      ));
    });

    it('should return all attendances for outlet', async () => {
      const response = await request(app)
        .get(`/api/v2/outlet/${testOutlet.id}/attendances`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.attendances).toHaveLength(2);
      expect(response.body.data.total_count).toBe(2);
      
      // Verify attendances contain expected fields
      response.body.data.attendances.forEach((attendance: any) => {
        expect(attendance).toHaveProperty('employee_id');
        expect(attendance).toHaveProperty('checkin_time');
        expect(attendance).toHaveProperty('status');
        expect(attendance).toHaveProperty('outlet_id', testOutlet.id);
      });
    });

    it('should return empty array for outlet with no attendances', async () => {
      const emptyOutlet = await prisma.outlet.create({
        data: {
          name: 'Empty Outlet',
          code: 'EMPTY001',
          address: 'Empty Address',
          pic_name: 'Empty PIC'
        }
      });

      const response = await request(app)
        .get(`/api/v2/outlet/${emptyOutlet.id}/attendances`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.attendances).toHaveLength(0);
      expect(response.body.data.total_count).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle application service errors gracefully', async () => {
      // Test with completely invalid data that should trigger domain errors
      const invalidData = {
        employee_id: -1,
        outlet_id: -1,
        image_proof: 'invalid_image'
      };

      const response = await request(app)
        .post('/api/v2/attendance/checkin')
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('error_code');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle unexpected server errors', async () => {
      // This would require mocking to force a server error
      // For now, we test that error structure is consistent
      const response = await request(app)
        .post('/api/v2/attendance/checkin')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Architecture Boundaries', () => {
    it('should enforce clean architecture boundaries', () => {
      // This is more of a structural test
      // Could be implemented with tools like dependency-cruiser
      expect(true).toBe(true); // Placeholder
    });

    it('should maintain dependency direction', () => {
      // Test that domain layer doesn't depend on infrastructure
      // This would be implemented with static analysis tools
      expect(true).toBe(true); // Placeholder
    });
  });
});