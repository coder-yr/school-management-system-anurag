import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response.js';
import { TransportRoute } from '../models/TransportRoute.js';
import { Types } from 'mongoose';

// Helper to seed routes if empty
async function ensureRoutesExist(schoolId: Types.ObjectId) {
  const count = await TransportRoute.countDocuments({ schoolId });
  if (count === 0) {
    const defaultRoutes = [
      {
        routeNo: 'Route 1',
        driverName: 'Suresh Kumar',
        driverPhone: '9876543210',
        busNo: 'MH-12-GQ-4432',
        capacity: 45,
        studentCount: 28,
        stops: [
          { name: 'Sector 15 Hub', time: '07:15', lat: 19.076, lng: 72.877 },
          { name: 'Main Gate', time: '07:30', lat: 19.082, lng: 72.885 },
          { name: 'Primary School Block', time: '07:45', lat: 19.090, lng: 72.895 }
        ],
        tripActive: true,
        currentLat: 19.076,
        currentLng: 72.877
      },
      {
        routeNo: 'Route 2',
        driverName: 'Ramesh Singh',
        driverPhone: '9876543211',
        busNo: 'MH-12-GQ-5567',
        capacity: 40,
        studentCount: 35,
        stops: [
          { name: 'Station Road', time: '07:00', lat: 19.100, lng: 72.900 },
          { name: 'Highway Junction', time: '07:20', lat: 19.110, lng: 72.910 },
          { name: 'Secondary Wing Gate', time: '07:45', lat: 19.120, lng: 72.920 }
        ],
        tripActive: false
      }
    ];

    for (const r of defaultRoutes) {
      await TransportRoute.create({
        schoolId,
        routeNo: r.routeNo,
        driverName: r.driverName,
        driverPhone: r.driverPhone,
        busNo: r.busNo,
        capacity: r.capacity,
        studentCount: r.studentCount,
        stops: r.stops,
        tripActive: r.tripActive,
        currentLat: r.currentLat,
        currentLng: r.currentLng,
        createdBy: new Types.ObjectId("000000000000000000000001"),
        updatedBy: new Types.ObjectId("000000000000000000000001")
      });
    }
  }
}

export class TransportController {
  static async getTransportRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const sId = new Types.ObjectId(schoolId as string);

      await ensureRoutesExist(sId);

      const routes = await TransportRoute.find({ schoolId: sId });

      const formatted = routes.map(r => ({
        id: r._id.toString(),
        route_no: r.routeNo,
        driver_name: r.driverName,
        driver_phone: r.driverPhone,
        driver_profile_id: r.driverProfileId ? r.driverProfileId.toString() : undefined,
        bus_no: r.busNo,
        capacity: r.capacity,
        student_count: r.studentCount,
        stops: r.stops.map(s => ({
          name: s.name,
          time: s.time,
          lat: s.lat,
          lng: s.lng
        })),
        current_lat: r.currentLat,
        current_lng: r.currentLng,
        trip_active: r.tripActive,
        last_location_at: r.lastLocationAt,
        created_at: (r as any).createdAt,
        updated_at: (r as any).updatedAt
      }));

      sendResponse(res, 200, 'Transport routes retrieved', formatted);
    } catch (error) {
      next(error);
    }
  }

  static async updateGPSLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { id } = req.params;
      const { latitude, longitude, tripActive } = req.body;

      const sId = new Types.ObjectId(schoolId as string);

      const updates: any = {
        currentLat: latitude,
        currentLng: longitude,
        lastLocationAt: new Date()
      };
      if (tripActive !== undefined) {
        updates.tripActive = tripActive;
      }

      const route = await TransportRoute.findOneAndUpdate(
        { schoolId: sId, _id: new Types.ObjectId(id as string) },
        { $set: updates },
        { new: true }
      );

      if (!route) {
        res.status(404).json({ success: false, message: 'Route not found' });
        return;
      }

      sendResponse(res, 200, 'GPS location updated', {
        id: route._id.toString(),
        route_no: route.routeNo,
        driver_name: route.driverName,
        driver_phone: route.driverPhone,
        driver_profile_id: route.driverProfileId ? route.driverProfileId.toString() : undefined,
        bus_no: route.busNo,
        capacity: route.capacity,
        student_count: route.studentCount,
        stops: route.stops.map(s => ({
          name: s.name,
          time: s.time,
          lat: s.lat,
          lng: s.lng
        })),
        current_lat: route.currentLat,
        current_lng: route.currentLng,
        trip_active: route.tripActive,
        last_location_at: route.lastLocationAt,
        created_at: (route as any).createdAt,
        updated_at: (route as any).updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTransportRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user?.schoolId || "000000000000000000000001";
      const { routeNo, driverName, driverPhone, busNo, capacity, students, currentLat, currentLng, stops } = req.body;
      const route = new TransportRoute({
        schoolId: new Types.ObjectId(schoolId as string),
        routeNo,
        driverName,
        driverPhone,
        busNo,
        capacity,
        studentCount: students || 0,
        currentLat,
        currentLng,
        stops,
        tripActive: true,
        createdBy: new Types.ObjectId(req.user?.id || "000000000000000000000001"),
        updatedBy: new Types.ObjectId(req.user?.id || "000000000000000000000001")
      });
      await route.save();
      sendResponse(res, 201, 'Route created', route);
    } catch (error) {
      next(error);
    }
  }
}
