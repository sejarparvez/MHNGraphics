import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

interface CleanupOptions {
  minutesThreshold?: number;
  userId?: string;
  dryRun?: boolean;
  includeImageCleanup?: boolean;
}

interface CleanupResult {
  success: boolean;
  deletedCount: number;
  deletedImages: number;
  failedImages: number;
  error?: string;
  deletedApplications?: Array<{
    id: string;
    studentName: string;
    imageId?: string | null;
  }>;
}

/**
 * Clean up pending applications and their associated images
 * @param options - Configuration options for cleanup
 * @returns Promise<CleanupResult>
 */
async function cleanupPendingApplications(
  options: CleanupOptions = {},
): Promise<CleanupResult> {
  const {
    minutesThreshold = 3,
    userId,
    dryRun = false,
    includeImageCleanup = true,
  } = options;

  try {
    // Build where condition
    const whereCondition = {
      applicationFee: 'Pending',
      createdAt: {
        lt: new Date(Date.now() - minutesThreshold * 60 * 1000),
      },
      ...(userId ? { userId } : {}), // Filter by user if provided
    };

    // First, find all pending applications that need to be deleted
    const pendingApplicationsToDelete = await prisma.application.findMany({
      where: whereCondition,
      select: {
        id: true,
        imageId: true,
        studentName: true,
        userId: true,
        createdAt: true,
      },
    });

    if (pendingApplicationsToDelete.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        deletedImages: 0,
        failedImages: 0,
        deletedApplications: [],
      };
    }

    // If dry run, just return what would be deleted
    if (dryRun) {
      return {
        success: true,
        deletedCount: pendingApplicationsToDelete.length,
        deletedImages: pendingApplicationsToDelete.filter((app) => app.imageId)
          .length,
        failedImages: 0,
        deletedApplications: pendingApplicationsToDelete,
      };
    }

    let deletedImages = 0;
    let failedImages = 0;

    // Delete images from Cloudinary if enabled
    if (includeImageCleanup) {
      for (const application of pendingApplicationsToDelete) {
        if (application.imageId) {
          try {
            const result = await cloudinary.uploader.destroy(
              application.imageId,
            );
            if (result.result === 'ok') {
              deletedImages++;
            } else {
              failedImages++;
            }
            // biome-ignore lint: error
          } catch (imageError) {
            failedImages++;
          }
        }
      }
    }

    // Delete applications from database
    const deletedApplications = await prisma.application.deleteMany({
      where: whereCondition,
    });

    return {
      success: true,
      deletedCount: deletedApplications.count,
      deletedImages,
      failedImages,
      deletedApplications: pendingApplicationsToDelete,
    };
  } catch (error) {
    return {
      success: false,
      deletedCount: 0,
      deletedImages: 0,
      failedImages: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clean up ALL pending applications for a specific user (no time threshold)
 */
export async function cleanupUserPendingApplications(
  userId: string,
): Promise<CleanupResult> {
  try {
    // Find all pending applications for the user (no time limit)
    const pendingApplicationsToDelete = await prisma.application.findMany({
      where: {
        userId,
        applicationFee: 'Pending',
      },
      select: {
        id: true,
        imageId: true,
        studentName: true,
        userId: true,
        createdAt: true,
      },
    });

    if (pendingApplicationsToDelete.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        deletedImages: 0,
        failedImages: 0,
        deletedApplications: [],
      };
    }

    let deletedImages = 0;
    let failedImages = 0;

    // Delete images from Cloudinary
    for (const application of pendingApplicationsToDelete) {
      if (application.imageId) {
        try {
          const result = await cloudinary.uploader.destroy(application.imageId);
          if (result.result === 'ok') {
            deletedImages++;
          } else {
            failedImages++;
          }
          // biome-ignore lint: error
        } catch (imageError) {
          failedImages++;
        }
      }
    }

    // Delete applications from database
    const deletedApplications = await prisma.application.deleteMany({
      where: {
        userId,
        applicationFee: 'Pending',
      },
    });

    return {
      success: true,
      deletedCount: deletedApplications.count,
      deletedImages,
      failedImages,
      deletedApplications: pendingApplicationsToDelete,
    };
  } catch (error) {
    return {
      success: false,
      deletedCount: 0,
      deletedImages: 0,
      failedImages: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clean up all pending applications system-wide (use carefully!)
 */
export async function cleanupAllPendingApplications(
  minutesThreshold: number = 3,
): Promise<CleanupResult> {
  return cleanupPendingApplications({
    minutesThreshold,
    includeImageCleanup: true,
  });
}
