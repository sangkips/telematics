import { Vehicle, Alert, User } from './types';
import { ROLE_PERMISSIONS } from './types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    permissions: ROLE_PERMISSIONS.admin
  },
  {
    id: '2',
    username: 'manager1',
    email: 'manager@company.com',
    firstName: 'Sarah',
    lastName: 'Manager',
    role: 'manager',
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    permissions: ROLE_PERMISSIONS.manager
  },
  {
    id: '3',
    username: 'operator1',
    email: 'operator@company.com',
    firstName: 'Mike',
    lastName: 'Operator',
    role: 'operator',
    status: 'active',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    permissions: ROLE_PERMISSIONS.operator
  },
  {
    id: '4',
    username: 'viewer1',
    email: 'viewer@company.com',
    firstName: 'Emma',
    lastName: 'Viewer',
    role: 'viewer',
    status: 'active',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date(),
    permissions: ROLE_PERMISSIONS.viewer
  }
];

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Fleet Alpha',
    plateNumber: 'ABC-1234',
    driver: 'John Smith',
    fuelLevel: 85,
    maxFuelCapacity: 100,
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '5th Avenue, New York, NY'
    },
    speed: 45,
    status: 'active',
    lastUpdate: new Date(),
    odometer: 125430,
    fuelConsumption: 8.5,
    alerts: [],
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    vin: '1HGBH41JXMN109186',
    maintenanceRecords: [
      {
        id: '1',
        vehicleId: '1',
        type: 'oil_change',
        description: 'Regular oil change and filter replacement',
        cost: 85.50,
        currency: 'USD',
        performedBy: 'AutoCare Service Center',
        performedAt: new Date('2024-01-15'),
        odometer: 120000,
        nextServiceOdometer: 130000,
        nextServiceDate: new Date('2024-04-15'),
        partsReplaced: ['Oil Filter', 'Engine Oil'],
        notes: 'Used synthetic oil as requested',
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      }
    ],
    nextServiceDue: new Date('2024-04-15'),
    nextServiceOdometer: 130000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Fleet Beta',
    plateNumber: 'DEF-5678',
    driver: 'Sarah Johnson',
    fuelLevel: 25,
    maxFuelCapacity: 100,
    location: {
      lat: 34.0522,
      lng: -118.2437,
      address: 'Hollywood Blvd, Los Angeles, CA'
    },
    speed: 0,
    status: 'idle',
    lastUpdate: new Date(),
    odometer: 98765,
    fuelConsumption: 9.2,
    alerts: [
      {
        id: '1',
        type: 'low_fuel',
        message: 'Low fuel level detected',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false
      }
    ],
    make: 'Honda',
    model: 'Accord',
    year: 2021,
    vin: '1HGCV1F30JA123456',
    maintenanceRecords: [
      {
        id: '2',
        vehicleId: '2',
        type: 'brake_service',
        description: 'Front brake pad replacement',
        cost: 245.00,
        currency: 'USD',
        performedBy: 'Brake Masters',
        performedAt: new Date('2024-01-10'),
        odometer: 95000,
        partsReplaced: ['Front Brake Pads', 'Brake Fluid'],
        notes: 'Rear brakes still in good condition',
        status: 'completed',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      }
    ],
    nextServiceDue: new Date('2025-01-10'), // Service due in future
    nextServiceOdometer: 105000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Fleet Gamma',
    plateNumber: 'GHI-9012',
    driver: 'Mike Wilson',
    fuelLevel: 45,
    maxFuelCapacity: 100,
    location: {
      lat: 41.8781,
      lng: -87.6298,
      address: 'Michigan Ave, Chicago, IL'
    },
    speed: 32,
    status: 'active',
    lastUpdate: new Date(),
    odometer: 87654,
    fuelConsumption: 7.8,
    alerts: [
      {
        id: '2',
        type: 'fuel_theft',
        message: 'Abnormal fuel drop detected - Possible theft',
        severity: 'critical',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        resolved: false
      }
    ],
    make: 'Ford',
    model: 'F-150',
    year: 2023,
    vin: '1FTFW1ET5DFC12345',
    maintenanceRecords: [
      {
        id: '3',
        vehicleId: '3',
        type: 'inspection',
        description: 'Annual safety inspection',
        cost: 125.00,
        currency: 'USD',
        performedBy: 'State Inspection Center',
        performedAt: new Date('2024-01-05'),
        odometer: 85000,
        nextServiceDate: new Date('2025-01-05'),
        status: 'completed',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
      }
    ],
    nextServiceDue: new Date('2024-02-20'), // Overdue service
    nextServiceOdometer: 90000,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Fleet Delta',
    plateNumber: 'JKL-3456',
    driver: 'Emily Davis',
    fuelLevel: 92,
    maxFuelCapacity: 100,
    location: {
      lat: 29.7604,
      lng: -95.3698,
      address: 'Main St, Houston, TX'
    },
    speed: 28,
    status: 'active',
    lastUpdate: new Date(),
    odometer: 156789,
    fuelConsumption: 8.1,
    alerts: [],
    make: 'Chevrolet',
    model: 'Silverado',
    year: 2022,
    vin: '1GCUYDED5JZ123456',
    maintenanceRecords: [
      {
        id: '4',
        vehicleId: '4',
        type: 'tire_rotation',
        description: 'Tire rotation and alignment check',
        cost: 89.99,
        currency: 'USD',
        performedBy: 'Tire Pro Service',
        performedAt: new Date('2024-01-20'),
        odometer: 155000,
        nextServiceOdometer: 165000,
        nextServiceDate: new Date('2024-07-20'),
        partsReplaced: [],
        notes: 'All tires in good condition',
        status: 'completed',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      }
    ],
    nextServiceDue: new Date('2024-07-20'),
    nextServiceOdometer: 165000,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date()
  }
];

export const generateRandomFuelData = (vehicleId: string, currentLevel: number) => {
  // Simulate fuel consumption or theft
  const random = Math.random();
  let newLevel = currentLevel;
  
  if (random < 0.02) { // 2% chance of fuel theft
    newLevel = Math.max(0, currentLevel - (10 + Math.random() * 20));
  } else if (random < 0.7) { // 70% chance of normal consumption
    newLevel = Math.max(0, currentLevel - (Math.random() * 0.5));
  }
  
  return Math.round(newLevel * 100) / 100;
};

export const generateRandomLocation = (lat: number, lng: number) => {
  const variation = 0.01;
  return {
    lat: lat + (Math.random() - 0.5) * variation,
    lng: lng + (Math.random() - 0.5) * variation
  };
};