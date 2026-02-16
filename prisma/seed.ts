import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Departments
  console.log('📁 Creating departments...');
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: {
        name: 'Engineering',
        description: 'Product development and engineering team',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: {
        name: 'Human Resources',
        description: 'HR and employee management',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Sales' },
      update: {},
      create: {
        name: 'Sales',
        description: 'Sales and business development',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: {
        name: 'Marketing',
        description: 'Marketing and communications',
      },
    }),
    prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: {
        name: 'Finance',
        description: 'Finance and accounting',
      },
    }),
  ]);
  console.log(`✅ Created ${departments.length} departments`);

  // 2. Create Admin User
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      employeeId: 'EMP001',
      email: 'admin@company.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      departmentId: departments[1].id, // HR Department
      designation: 'System Administrator',
      joiningDate: new Date('2024-01-01'),
      status: 'ACTIVE',
      phoneNumber: '+1234567890',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 3. Create Leave Types
  console.log('📅 Creating leave types...');
  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({
      where: { code: 'CL' },
      update: {},
      create: {
        name: 'Casual Leave',
        code: 'CL',
        description: 'For personal matters and short-term absences',
        defaultAnnualQuota: 12,
        isPaid: true,
        requiresApproval: true,
        maxConsecutiveDays: 5,
        minDaysNotice: 1,
        isActive: true,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: 'PL' },
      update: {},
      create: {
        name: 'Privilege Leave',
        code: 'PL',
        description: 'Earned leave for vacation and extended absence',
        defaultAnnualQuota: 18,
        isPaid: true,
        requiresApproval: true,
        maxConsecutiveDays: 15,
        minDaysNotice: 7,
        isActive: true,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: 'SL' },
      update: {},
      create: {
        name: 'Sick Leave',
        code: 'SL',
        description: 'For medical reasons and health issues',
        defaultAnnualQuota: 10,
        isPaid: true,
        requiresApproval: true,
        maxConsecutiveDays: 10,
        minDaysNotice: 0,
        isActive: true,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: 'ML' },
      update: {},
      create: {
        name: 'Maternity Leave',
        code: 'ML',
        description: 'Maternity leave for new mothers',
        defaultAnnualQuota: 180,
        isPaid: true,
        requiresApproval: true,
        minDaysNotice: 30,
        isActive: true,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: 'PTL' },
      update: {},
      create: {
        name: 'Paternity Leave',
        code: 'PTL',
        description: 'Paternity leave for new fathers',
        defaultAnnualQuota: 15,
        isPaid: true,
        requiresApproval: true,
        minDaysNotice: 7,
        isActive: true,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: 'UL' },
      update: {},
      create: {
        name: 'Unpaid Leave',
        code: 'UL',
        description: 'Leave without pay',
        defaultAnnualQuota: 0,
        isPaid: false,
        requiresApproval: true,
        minDaysNotice: 7,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${leaveTypes.length} leave types`);

  // 4. Initialize Leave Balances for Admin
  console.log('💰 Initializing leave balances for admin...');
  const currentYear = new Date().getFullYear();
  let balanceCount = 0;

  for (const leaveType of leaveTypes) {
    if (leaveType.defaultAnnualQuota > 0) {
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveTypeId_year: {
            userId: admin.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
          },
        },
        update: {},
        create: {
          userId: admin.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
          totalAllocated: leaveType.defaultAnnualQuota,
          used: 0,
          carryForward: 0,
        },
      });
      balanceCount++;
    }
  }
  console.log(`✅ Initialized ${balanceCount} leave balances`);

  // 5. Create Public Holidays for 2025-2026
  console.log('🎉 Creating public holidays...');
  const holidays = [
    // 2025 Holidays
    { name: 'New Year\'s Day', date: new Date('2025-01-01'), year: 2025 },
    { name: 'Republic Day', date: new Date('2025-01-26'), year: 2025 },
    { name: 'Holi', date: new Date('2025-03-14'), year: 2025 },
    { name: 'Good Friday', date: new Date('2025-04-18'), year: 2025 },
    { name: 'Independence Day', date: new Date('2025-08-15'), year: 2025 },
    { name: 'Gandhi Jayanti', date: new Date('2025-10-02'), year: 2025 },
    { name: 'Diwali', date: new Date('2025-10-20'), year: 2025 },
    { name: 'Christmas', date: new Date('2025-12-25'), year: 2025 },
    // 2026 Holidays
    { name: 'New Year\'s Day', date: new Date('2026-01-01'), year: 2026 },
    { name: 'Republic Day', date: new Date('2026-01-26'), year: 2026 },
    { name: 'Independence Day', date: new Date('2026-08-15'), year: 2026 },
    { name: 'Gandhi Jayanti', date: new Date('2026-10-02'), year: 2026 },
    { name: 'Christmas', date: new Date('2026-12-25'), year: 2026 },
  ];

  let holidayCount = 0;
  for (const holiday of holidays) {
    await prisma.holiday.upsert({
      where: {
        date_location: {
          date: holiday.date,
          location: 'Default',
        },
      },
      update: {},
      create: {
        name: holiday.name,
        date: holiday.date,
        year: holiday.year,
        type: 'PUBLIC',
        description: `${holiday.name} - Public Holiday`,
        location: 'Default',
        isRecurring: true,
      },
    });
    holidayCount++;
  }
  console.log(`✅ Created ${holidayCount} public holidays`);

  // 6. Create Sample Policy
  console.log('📜 Creating sample policy...');
  const existingPolicy = await prisma.policy.findFirst({
    where: { title: 'Company Code of Conduct' }
  });

  if (!existingPolicy) {
    await prisma.policy.create({
      data: {
        title: 'Company Code of Conduct',
      content: `# Company Code of Conduct

## 1. Introduction
This policy outlines the expected behavior and ethical standards for all employees of our organization.

## 2. Core Values
- Integrity
- Respect
- Accountability
- Excellence
- Collaboration

## 3. Professional Conduct
All employees are expected to:
- Treat colleagues with respect and dignity
- Maintain confidentiality of company information
- Avoid conflicts of interest
- Report any unethical behavior

## 4. Compliance
This policy must be acknowledged by all employees within 30 days of joining or policy publication.`,
      category: 'Ethics',
      version: '1.0',
      isActive: true,
      publishedDate: new Date(),
      publishedBy: admin.id,
      effectiveDate: new Date(),
      acknowledgmentRequired: true,
      },
    });
    console.log('✅ Sample policy created');
  } else {
    console.log('ℹ️  Sample policy already exists');
  }

  // 7. Create Sample Announcement
  console.log('📢 Creating sample announcement...');
  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { title: 'Welcome to the Employee Portal' }
  });

  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        title: 'Welcome to the Employee Portal',
      content: `We are excited to announce the launch of our new employee management portal! This platform will streamline attendance tracking, leave management, and internal communications. Please explore all features and don't hesitate to reach out to HR if you have any questions.`,
      priority: 'HIGH',
      publishedDate: new Date(),
      publishedBy: admin.id,
      isActive: true,
      targetAudience: {
        departments: [],
        roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
        specificUsers: [],
      },
      },
    });
    console.log('✅ Sample announcement created');
  } else {
    console.log('ℹ️  Sample announcement already exists');
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Summary:');
  console.log(`   - Departments: ${departments.length}`);
  console.log(`   - Admin users: 1`);
  console.log(`   - Leave types: ${leaveTypes.length}`);
  console.log(`   - Holidays: ${holidayCount}`);
  console.log(`   - Policies: 1`);
  console.log(`   - Announcements: 1`);
  console.log('\n🔑 Admin credentials:');
  console.log(`   Email: admin@company.com`);
  console.log(`   Password: Admin@123`);
  console.log('\n⚠️  Remember to change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
