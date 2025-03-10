import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTravelRequestSchema,
  insertTravelerSchema,
  insertTransportationSchema,
  insertAccommodationSchema,
  type TravelRequestStatus 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Travel Request routes
  app.get("/api/travel-requests", async (_req, res) => {
    const requests = await storage.getTravelRequests();
    res.json(requests);
  });

  app.get("/api/travel-requests/:id", async (req, res) => {
    const request = await storage.getTravelRequest(Number(req.params.id));
    if (!request) {
      return res.status(404).json({ message: "Travel request not found" });
    }
    res.json(request);
  });

  app.post("/api/travel-requests", async (req, res) => {
    try {
      const data = insertTravelRequestSchema.parse(req.body);
      const userId = 1; // For demo purposes
      const request = await storage.createTravelRequest(userId, data);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.patch("/api/travel-requests/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      const request = await storage.updateTravelRequestStatus(
        Number(req.params.id),
        status as TravelRequestStatus
      );
      res.json(request);
    } catch (error) {
      res.status(404).json({ message: "Travel request not found" });
    }
  });

  // Traveler routes
  app.get("/api/travel-requests/:requestId/travelers", async (req, res) => {
    const travelers = await storage.getTravelers(Number(req.params.requestId));
    res.json(travelers);
  });

  app.post("/api/travelers", async (req, res) => {
    try {
      const data = insertTravelerSchema.parse(req.body);
      const traveler = await storage.createTraveler(data);
      res.status(201).json(traveler);
    } catch (error) {
      res.status(400).json({ message: "Invalid traveler data" });
    }
  });

  // Transportation routes
  app.get("/api/travelers/:travelerId/transportation", async (req, res) => {
    const transportation = await storage.getTransportation(Number(req.params.travelerId));
    res.json(transportation);
  });

  app.post("/api/transportation", async (req, res) => {
    try {
      const data = insertTransportationSchema.parse(req.body);
      const transportation = await storage.createTransportation(data);
      res.status(201).json(transportation);
    } catch (error) {
      res.status(400).json({ message: "Invalid transportation data" });
    }
  });

  // Accommodation routes
  app.get("/api/travelers/:travelerId/accommodation", async (req, res) => {
    const accommodation = await storage.getAccommodation(Number(req.params.travelerId));
    res.json(accommodation);
  });

  app.post("/api/accommodation", async (req, res) => {
    try {
      const data = insertAccommodationSchema.parse(req.body);
      const accommodation = await storage.createAccommodation(data);
      res.status(201).json(accommodation);
    } catch (error) {
      res.status(400).json({ message: "Invalid accommodation data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}