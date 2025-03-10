import { 
  users, type User, type InsertUser,
  travelRequests, type TravelRequest, type InsertTravelRequest,
  travelers, type Traveler, type InsertTraveler,
  transportation, type Transportation, type InsertTransportation,
  accommodation, type Accommodation, type InsertAccommodation,
  type TravelRequestStatus
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Travel Request methods
  getTravelRequests(): Promise<TravelRequest[]>;
  getTravelRequest(id: number): Promise<TravelRequest | undefined>;
  createTravelRequest(userId: number, request: InsertTravelRequest): Promise<TravelRequest>;
  updateTravelRequestStatus(id: number, status: TravelRequestStatus): Promise<TravelRequest>;

  // Traveler methods
  getTravelers(requestId: number): Promise<Traveler[]>;
  createTraveler(traveler: InsertTraveler): Promise<Traveler>;

  // Transportation methods
  getTransportation(travelerId: number): Promise<Transportation[]>;
  createTransportation(transportation: InsertTransportation): Promise<Transportation>;

  // Accommodation methods
  getAccommodation(travelerId: number): Promise<Accommodation[]>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private travelRequests: Map<number, TravelRequest>;
  private travelers: Map<number, Traveler>;
  private transportation: Map<number, Transportation>;
  private accommodation: Map<number, Accommodation>;
  private userId: number;
  private requestId: number;
  private travelerId: number;
  private transportationId: number;
  private accommodationId: number;

  constructor() {
    this.users = new Map();
    this.travelRequests = new Map();
    this.travelers = new Map();
    this.transportation = new Map();
    this.accommodation = new Map();
    this.userId = 1;
    this.requestId = 1;
    this.travelerId = 1;
    this.transportationId = 1;
    this.accommodationId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Travel Request methods
  async getTravelRequests(): Promise<TravelRequest[]> {
    return Array.from(this.travelRequests.values());
  }

  async getTravelRequest(id: number): Promise<TravelRequest | undefined> {
    return this.travelRequests.get(id);
  }

  async createTravelRequest(userId: number, request: InsertTravelRequest): Promise<TravelRequest> {
    const id = this.requestId++;
    const travelRequest: TravelRequest = {
      id,
      userId,
      departmentCode: request.departmentCode,
      purpose: request.purpose,
      numberOfTravelers: request.numberOfTravelers,
      totalAmount: request.totalAmount,
      status: 'pending'
    };
    this.travelRequests.set(id, travelRequest);
    return travelRequest;
  }

  async updateTravelRequestStatus(id: number, status: TravelRequestStatus): Promise<TravelRequest> {
    const request = this.travelRequests.get(id);
    if (!request) {
      throw new Error('Travel request not found');
    }
    const updatedRequest = { ...request, status };
    this.travelRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Traveler methods
  async getTravelers(requestId: number): Promise<Traveler[]> {
    return Array.from(this.travelers.values())
      .filter(traveler => traveler.requestId === requestId);
  }

  async createTraveler(insertTraveler: InsertTraveler): Promise<Traveler> {
    const id = this.travelerId++;
    const traveler: Traveler = { ...insertTraveler, id };
    this.travelers.set(id, traveler);
    return traveler;
  }

  // Transportation methods
  async getTransportation(travelerId: number): Promise<Transportation[]> {
    return Array.from(this.transportation.values())
      .filter(transport => transport.travelerId === travelerId);
  }

  async createTransportation(insertTransportation: InsertTransportation): Promise<Transportation> {
    const id = this.transportationId++;
    const transportation: Transportation = { ...insertTransportation, id };
    this.transportation.set(id, transportation);
    return transportation;
  }

  // Accommodation methods
  async getAccommodation(travelerId: number): Promise<Accommodation[]> {
    return Array.from(this.accommodation.values())
      .filter(acc => acc.travelerId === travelerId);
  }

  async createAccommodation(insertAccommodation: InsertAccommodation): Promise<Accommodation> {
    const id = this.accommodationId++;
    const accommodation: Accommodation = { ...insertAccommodation, id };
    this.accommodation.set(id, accommodation);
    return accommodation;
  }
}

export const storage = new MemStorage();