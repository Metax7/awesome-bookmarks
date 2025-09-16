import { NextResponse } from "next/server";
import { categoryOperations } from "@/lib/db/operations";

export async function POST() {
  try {
    // Check if categories already exist
    const existingCategories = await categoryOperations.getAll();
    if (existingCategories.length > 0) {
      return NextResponse.json({ message: "Categories already exist" });
    }

    // Create default categories
    const defaultCategories = [
      { name: "Development", color: "#3b82f6" },
      { name: "Design", color: "#ef4444" },
      { name: "News", color: "#10b981" },
      { name: "Education", color: "#8b5cf6" },
      { name: "Tools", color: "#f59e0b" },
    ];

    const createdCategories = [];
    for (const category of defaultCategories) {
      const id = await categoryOperations.create(category);
      const createdCategory = await categoryOperations.getById(id);
      if (createdCategory) {
        createdCategories.push(createdCategory);
      }
    }

    return NextResponse.json({
      message: "Default categories created successfully",
      categories: createdCategories,
    });
  } catch (error) {
    console.error("Error seeding categories:", error);
    return NextResponse.json(
      { error: "Failed to seed categories" },
      { status: 500 }
    );
  }
}
