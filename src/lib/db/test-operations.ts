import { bookmarkOperations, categoryOperations, utilityOperations } from './operations';
import { initializeDatabase } from './init';

/**
 * Test script to verify database operations work correctly
 */
export async function testDatabaseOperations() {
  console.log('🧪 Testing database operations...');

  try {
    // Initialize database
    console.log('1. Initializing database...');
    const initialized = await initializeDatabase();
    if (!initialized) {
      throw new Error('Failed to initialize database');
    }
    console.log('✅ Database initialized');

    // Test category operations
    console.log('2. Testing category operations...');
    const categories = await categoryOperations.getAll();
    console.log(`✅ Found ${categories.length} categories`);

    if (categories.length === 0) {
      console.log('⚠️ No categories found, seeding default categories...');
      await utilityOperations.seedDefaultCategories();
      const newCategories = await categoryOperations.getAll();
      console.log(`✅ Seeded ${newCategories.length} categories`);
    }

    // Test creating a bookmark
    console.log('3. Testing bookmark creation...');
    const testCategory = categories[0] || (await categoryOperations.getAll())[0];
    
    const bookmarkId = await bookmarkOperations.create({
      title: 'Test Bookmark',
      url: 'https://example.com',
      description: 'This is a test bookmark',
      categoryId: testCategory.id,
      tags: ['test', 'example'],
    });
    console.log(`✅ Created bookmark with ID: ${bookmarkId}`);

    // Test retrieving bookmarks
    console.log('4. Testing bookmark retrieval...');
    const allBookmarks = await bookmarkOperations.getAll();
    console.log(`✅ Found ${allBookmarks.length} bookmarks`);

    // Test search
    console.log('5. Testing search functionality...');
    const searchResults = await bookmarkOperations.search({
      query: 'test',
    });
    console.log(`✅ Search found ${searchResults.bookmarks.length} bookmarks`);

    // Test updating bookmark
    console.log('6. Testing bookmark update...');
    await bookmarkOperations.update(bookmarkId, {
      title: 'Updated Test Bookmark',
    });
    const updatedBookmark = await bookmarkOperations.getById(bookmarkId);
    console.log(`✅ Updated bookmark title: ${updatedBookmark?.title}`);

    // Test database stats
    console.log('7. Testing database stats...');
    const stats = await utilityOperations.getDatabaseStats();
    console.log(`✅ Database stats: ${JSON.stringify(stats)}`);

    // Clean up test data
    console.log('8. Cleaning up test data...');
    await bookmarkOperations.delete(bookmarkId);
    console.log('✅ Test bookmark deleted');

    console.log('🎉 All database operations tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Database operations test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testDatabaseOperations()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}