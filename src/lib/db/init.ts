import { prisma, connectToDatabase, checkDatabaseHealth } from "./prisma";
import { utilityOperations } from "./operations";

/**
 * Initialize the database connection and seed default data
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      throw new Error("Failed to connect to database");
    }

    // Check database health
    const healthy = await checkDatabaseHealth();
    if (!healthy) {
      throw new Error("Database health check failed");
    }

    // Seed default categories if none exist
    await utilityOperations.seedDefaultCategories();

    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}

/**
 * Gracefully shutdown database connection
 */
export async function shutdownDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}

/**
 * Reset database to initial state (useful for development/testing)
 */
export async function resetDatabase(): Promise<void> {
  try {
    await utilityOperations.clearAllData();
    await utilityOperations.seedDefaultCategories();
    console.log("Database reset successfully");
  } catch (error) {
    console.error("Database reset failed:", error);
    throw error;
  }
}
