import { Test, TestingModule } from "@nestjs/testing";
import { ChargesService } from "./charges.service";
import { PrismaService } from "../prisma/prisma.service";
import { getQueueToken } from "@nestjs/bullmq";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateChargeDto } from "./dto/create-charge.dto";

describe("ChargesService", () => {
  let service: ChargesService;
  let prismaService: PrismaService;
  let chargesQueue: { add: jest.Mock };

  beforeEach(async () => {
    chargesQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const mockPrismaService = {
      activeSubscription: {
        findUnique: jest.fn(),
      },
      charge: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken("charges"),
          useValue: chargesQueue,
        },
      ],
    }).compile();

    service = module.get<ChargesService>(ChargesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createCharge", () => {
    it("should create a charge successfully", async () => {
      const createChargeDto: CreateChargeDto = {
        subscriptionId: "sub-123",
        amount: 100,
        chargeDate: "2025-08-10T00:00:00Z",
        description: "Test charge",
      };

      const mockSubscription = {
        id: "sub-123",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        customerId: "cust-123",
        planId: "plan-123",
        startDate: new Date(),
        nextBilling: new Date(),
        customer: {
          id: "cust-123",
          name: "Lorem Ipsum",
          email: "lorem@ipsum.com",
        },
        plan: {
          id: "plan-123",
          name: "Premium Plan",
        },
      };

      const mockCreatedCharge = {
        id: "charge-123",
        subscriptionId: "sub-123",
        amount: 100,
        chargeDate: new Date("2025-08-10T00:00:00Z"),
        status: "pending",
        description: "Test charge",
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: mockSubscription,
      };

      jest
        .spyOn(prismaService.activeSubscription, "findUnique")
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(prismaService.charge, "create")
        .mockResolvedValue(mockCreatedCharge);

      const result = await service.createCharge(createChargeDto);

      expect(prismaService.activeSubscription.findUnique).toHaveBeenCalledWith({
        where: { id: "sub-123" },
        include: {
          customer: true,
          plan: true,
        },
      });

      expect(prismaService.charge.create).toHaveBeenCalledWith({
        data: {
          subscriptionId: "sub-123",
          amount: 100,
          chargeDate: expect.any(Date),
          status: "pending",
          description: "Test charge",
          attempts: 0,
        },
        include: {
          subscription: {
            include: {
              customer: true,
              plan: true,
            },
          },
        },
      });

      expect(chargesQueue.add).toHaveBeenCalledWith(
        "send-charge-email",
        expect.objectContaining({
          chargeId: "charge-123",
          customerEmail: "lorem@ipsum.com",
          customerName: "Lorem Ipsum",
          amount: 100,
          planName: "Premium Plan",
        }),
        expect.objectContaining({
          attempts: 5,
          backoff: { type: "exponential", delay: 10_000 },
          removeOnComplete: true,
        })
      );

      expect(result).toEqual(mockCreatedCharge);
    });

    it("should throw NotFoundException if subscription is not found", async () => {
      jest
        .spyOn(prismaService.activeSubscription, "findUnique")
        .mockResolvedValue(null);

      const createChargeDto: CreateChargeDto = {
        subscriptionId: "non-existent-id",
        amount: 100,
      };

      await expect(service.createCharge(createChargeDto)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.createCharge(createChargeDto)).rejects.toThrow(
        "Subscription not found"
      );
    });

    it("should throw BadRequestException if subscription is not active", async () => {
      const mockInactiveSubscription = {
        id: "sub-123",
        status: "cancelled",
        createdAt: new Date(),
        updatedAt: new Date(),
        customerId: "cust-123",
        planId: "plan-123",
        startDate: new Date(),
        nextBilling: new Date(),
        customer: {
          id: "cust-123",
          name: "Lorem Ipsum",
          email: "lorem@ipsum.com",
        },
        plan: {
          id: "plan-123",
          name: "Premium Plan",
        },
      };

      jest
        .spyOn(prismaService.activeSubscription, "findUnique")
        .mockResolvedValue(mockInactiveSubscription);

      const createChargeDto: CreateChargeDto = {
        subscriptionId: "sub-123",
        amount: 100,
      };

      await expect(service.createCharge(createChargeDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.createCharge(createChargeDto)).rejects.toThrow(
        "Subscription is not active"
      );
    });
  });

  describe("findCharges", () => {
    const mockCharges = [
      {
        id: "charge-1",
        subscriptionId: "sub-1",
        amount: 100,
        chargeDate: new Date("2025-08-10"),
        status: "pending",
        description: "Monthly subscription",
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          id: "sub-1",
          customerId: "cust-1",
          customer: {
            id: "cust-1",
            name: "Customer 1",
            email: "customer1@example.com",
          },
          plan: { id: "plan-1", name: "Basic Plan" },
        },
      },
      {
        id: "charge-2",
        subscriptionId: "sub-2",
        amount: 200,
        chargeDate: new Date("2025-08-11"),
        status: "paid",
        description: "Annual subscription",
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          id: "sub-2",
          customerId: "cust-2",
          customer: {
            id: "cust-2",
            name: "Customer 2",
            email: "customer2@example.com",
          },
          plan: { id: "plan-2", name: "Premium Plan" },
        },
      },
    ];

    it("should retrieve all charges when no filters are provided", async () => {
      jest
        .spyOn(prismaService.charge, "findMany")
        .mockResolvedValue(mockCharges);

      const result = await service.findCharges();

      expect(prismaService.charge.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          subscription: {
            include: {
              customer: true,
              plan: true,
            },
          },
        },
        orderBy: {
          chargeDate: "desc",
        },
      });
      expect(result).toEqual(mockCharges);
    });

    it("should filter charges by status", async () => {
      const pendingCharges = [mockCharges[0]];
      jest
        .spyOn(prismaService.charge, "findMany")
        .mockResolvedValue(pendingCharges);

      const result = await service.findCharges({ status: "pending" });

      expect(prismaService.charge.findMany).toHaveBeenCalledWith({
        where: { status: "pending" },
        include: {
          subscription: {
            include: {
              customer: true,
              plan: true,
            },
          },
        },
        orderBy: {
          chargeDate: "desc",
        },
      });
      expect(result).toEqual(pendingCharges);
    });

    it("should filter charges by subscriptionId", async () => {
      const filteredCharges = [mockCharges[0]];
      jest
        .spyOn(prismaService.charge, "findMany")
        .mockResolvedValue(filteredCharges);

      const result = await service.findCharges({ subscriptionId: "sub-1" });

      expect(prismaService.charge.findMany).toHaveBeenCalledWith({
        where: { subscriptionId: "sub-1" },
        include: {
          subscription: {
            include: {
              customer: true,
              plan: true,
            },
          },
        },
        orderBy: {
          chargeDate: "desc",
        },
      });
      expect(result).toEqual(filteredCharges);
    });

    it("should filter charges by customerId", async () => {
      const filteredCharges = [mockCharges[0]];
      jest
        .spyOn(prismaService.charge, "findMany")
        .mockResolvedValue(filteredCharges);

      const result = await service.findCharges({ customerId: "cust-1" });

      expect(prismaService.charge.findMany).toHaveBeenCalledWith({
        where: {
          subscription: {
            customerId: "cust-1",
          },
        },
        include: {
          subscription: {
            include: {
              customer: true,
              plan: true,
            },
          },
        },
        orderBy: {
          chargeDate: "desc",
        },
      });
      expect(result).toEqual(filteredCharges);
    });

    it("should apply multiple filters when provided", async () => {
      const filteredCharges = [mockCharges[0]];
      jest
        .spyOn(prismaService.charge, "findMany")
        .mockResolvedValue(filteredCharges);

      const result = await service.findCharges({
        status: "pending",
        customerId: "cust-1",
        subscriptionId: "sub-1",
      });

      expect(prismaService.charge.findMany).toHaveBeenCalledWith({
        where: {
          status: "pending",
          subscriptionId: "sub-1",
          subscription: {
            customerId: "cust-1",
          },
        },
        include: {
          subscription: {
            include: {
              customer: true,
              plan: true,
            },
          },
        },
        orderBy: {
          chargeDate: "desc",
        },
      });
      expect(result).toEqual(filteredCharges);
    });
  });

  describe("findChargeById", () => {
    it("should retrieve a charge by id", async () => {
      const mockCharge = {
        id: "charge-1",
        subscriptionId: "sub-1",
        amount: 100,
        chargeDate: new Date("2025-08-10"),
        status: "pending",
        description: "Monthly subscription",
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          id: "sub-1",
          customerId: "cust-1",
          customer: {
            id: "cust-1",
            name: "Customer 1",
            email: "customer1@example.com",
          },
          plan: { id: "plan-1", name: "Basic Plan" },
        },
        payments: [],
      };

      jest
        .spyOn(prismaService.charge, "findUnique")
        .mockResolvedValue(mockCharge as any);

      const result = await service.findChargeById("charge-1");

      expect(prismaService.charge.findUnique).toHaveBeenCalledWith({
        where: { id: "charge-1" },
        include: {
          subscription: {
            include: {
              customer: true,
              plan: true,
            },
          },
          payments: true,
        },
      });
      expect(result).toEqual(mockCharge);
    });

    it("should throw NotFoundException if charge does not exist", async () => {
      jest.spyOn(prismaService.charge, "findUnique").mockResolvedValue(null);

      await expect(service.findChargeById("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
      await expect(service.findChargeById("non-existent-id")).rejects.toThrow(
        "Charge not found"
      );
    });
  });
});
