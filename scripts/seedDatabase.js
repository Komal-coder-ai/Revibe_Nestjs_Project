const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection - Update this with your connection string
const MONGODB_URI = 'mongodb+srv://revibeindiatech_db_user:acikdngNPQZKqLO1@cluster0.xp3ajkp.mongodb.net/revibe';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  process.exit(1);
}

// Define schemas inline
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] }
}, { timestamps: true });

const CustomerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Komal@123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // Create Admin
    console.log('🔄 Creating admin user...');
    const existingAdmin = await Admin.findOne({ email: 'komalp@mailinator.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists. Updating...');
      await Admin.updateOne(
        { email: 'komalp@mailinator.com' },
        {
          password: adminPassword,
          name: 'Komal P',
          role: 'admin'
        }
      );
      console.log('✅ Admin updated successfully');
    } else {
      await Admin.create({
        email: 'komalp@mailinator.com',
        password: adminPassword,
        name: 'Komal P',
        role: 'admin'
      });
      console.log('✅ Admin created successfully');
    }

    console.log('📧 Email: Komalp@mailinator.com');
    console.log('🔑 Password: Komal@123\n');

    // Create Customer
    console.log('🔄 Creating customer user...');
    const existingCustomer = await Customer.findOne({ email: 'customer@example.com' });
    
    if (existingCustomer) {
      console.log('⚠️  Customer already exists. Updating...');
      await Customer.updateOne(
        { email: 'customer@example.com' },
        {
          password: customerPassword,
          name: 'Customer User',
          phone: '1234567890',
          address: '123 Main Street, City, Country'
        }
      );
      console.log('✅ Customer updated successfully');
    } else {
      await Customer.create({
        email: 'customer@example.com',
        password: customerPassword,
        name: 'Customer User',
        phone: '1234567890',
        address: '123 Main Street, City, Country'
      });
      console.log('✅ Customer created successfully');
    }

    console.log('📧 Email: customer@example.com');
    console.log('🔑 Password: customer123\n');

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 You can now login with:');
    console.log('   Admin: Komalp@mailinator.com / Komal@123');
    console.log('   Customer: customer@example.com / customer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

seedDatabase();
