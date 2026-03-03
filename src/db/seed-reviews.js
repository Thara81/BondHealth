const { query } = require('./config');

async function seedReviews() {
  console.log('🌱 Seeding sample reviews...');
  
  try {
    // First, get some patient IDs
    const patients = await query(
      `SELECT p.patient_id, p.full_name, p.email, u.user_id 
       FROM patients p 
       JOIN users u ON p.user_id = u.user_id 
       LIMIT 10`
    );
    
    if (patients.rows.length === 0) {
      console.log('❌ No patients found. Please create some patient accounts first.');
      console.log('   You can create patients by:');
      console.log('   1. Visiting http://localhost:3005/patient-signup');
      console.log('   2. Or running your init.js to create sample data');
      return;
    }
    
    console.log(`✅ Found ${patients.rows.length} patients to associate reviews with`);
    
    // Sample review data
    const sampleReviews = [
      {
        rating: 5,
        title: "Excellent care and service",
        content: "The staff was incredibly professional and caring. Dr. Sarah took time to explain everything thoroughly. The facility was clean and modern. Highly recommend!",
        hospital: "City General Hospital",
        doctor: "Dr. Sarah Johnson"
      },
      {
        rating: 4,
        title: "Very good experience overall",
        content: "Had a great experience with the team. Wait time was reasonable and the doctor was knowledgeable. The only minor issue was scheduling follow-up.",
        hospital: "St. Mary's Medical",
        doctor: "Dr. Michael Chen"
      },
      {
        rating: 5,
        title: "Life-saving care",
        content: "I came in with severe chest pain and they took immediate action. The cardiology team was phenomenal. Grateful for their quick response and expertise.",
        hospital: "Regional Health Center",
        doctor: "Dr. Emily Rodriguez"
      },
      {
        rating: 3,
        title: "Good but room for improvement",
        content: "The doctor was great but the front desk staff seemed overwhelmed. Had to wait 45 minutes past my appointment time. Facilities were clean though.",
        hospital: "Unity Care Hospital",
        doctor: "Dr. James Wilson"
      },
      {
        rating: 2,
        title: "Long wait times",
        content: "Waited over 2 hours despite having an appointment. The doctor was rushed and didn't seem to listen to all my concerns. Disappointing experience.",
        hospital: "City General Hospital",
        doctor: "Dr. Amanda Lee"
      },
      {
        rating: 5,
        title: "Best hospital experience ever",
        content: "From check-in to discharge, everything was seamless. The nurses were attentive and the doctor was thorough. They even followed up the next day!",
        hospital: "St. Mary's Medical",
        doctor: "Dr. Robert Brown"
      },
      {
        rating: 4,
        title: "Great pediatric care",
        content: "Took my daughter here for her checkup. The pediatrician was wonderful with kids. The waiting area had toys which kept her entertained.",
        hospital: "Children's Health Center",
        doctor: "Dr. Lisa Thompson"
      },
      {
        rating: 1,
        title: "Poor communication",
        content: "Had a very frustrating experience. Was given wrong information about insurance coverage. Ended up with unexpected bills. Would not recommend.",
        hospital: "Regional Health Center",
        doctor: "Dr. David Miller"
      },
      {
        rating: 5,
        title: "Excellent emergency care",
        content: "Came in late at night with a broken arm. The ER staff was efficient and compassionate. X-ray was done quickly and they took great care of me.",
        hospital: "Unity Care Hospital",
        doctor: "Dr. Patricia Garcia"
      },
      {
        rating: 4,
        title: "Good experience with surgery",
        content: "Had outpatient surgery here. The anesthesiologist was reassuring and the recovery nurses were attentive. Recovery room could be more comfortable.",
        hospital: "City General Hospital",
        doctor: "Dr. Thomas Anderson"
      },
      {
        rating: 5,
        title: "Changed my life",
        content: "Dr. Williams diagnosed my condition after years of suffering. The treatment plan has been life-changing. Forever grateful to this team.",
        hospital: "St. Mary's Medical",
        doctor: "Dr. Jennifer Williams"
      },
      {
        rating: 3,
        title: "Mixed experience",
        content: "Some aspects were great, others not so much. The doctor was excellent but the billing department was difficult to deal with.",
        hospital: "Regional Health Center",
        doctor: "Dr. Christopher Davis"
      }
    ];
    
    console.log(`📝 Preparing to insert ${sampleReviews.length} sample reviews...`);
    
    // Insert reviews
    let insertedCount = 0;
    for (let i = 0; i < sampleReviews.length; i++) {
      const review = sampleReviews[i];
      const patient = patients.rows[i % patients.rows.length];
      
      // Generate a random date within the last 90 days
      const daysAgo = Math.floor(Math.random() * 90);
      
      await query(
        `INSERT INTO reviews (
          user_id, patient_id, reviewer_name, reviewer_email,
          rating, title, content, hospital_name, doctor_name,
          is_verified, is_approved, helpful_count, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
          CURRENT_TIMESTAMP - INTERVAL '${daysAgo} days')`,
        [
          patient.user_id,
          patient.patient_id,
          patient.full_name,
          patient.email,
          review.rating,
          review.title,
          review.content,
          review.hospital,
          review.doctor,
          true, // is_verified
          true, // is_approved
          Math.floor(Math.random() * 20) // helpful_count
        ]
      );
      
      insertedCount++;
      console.log(`  ✅ Inserted review ${i + 1}: "${review.title}" (${review.rating}★)`);
    }
    
    console.log(`\n🎉 Successfully seeded ${insertedCount} sample reviews!`);
    
    // Show summary
    const stats = await query(
      `SELECT 
        COUNT(*) as total,
        ROUND(AVG(rating)::numeric, 1) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews`
    );
    
    console.log('\n📊 Review Summary:');
    console.log(`   Total Reviews: ${stats.rows[0].total}`);
    console.log(`   Average Rating: ${stats.rows[0].avg_rating}`);
    console.log(`   5★: ${stats.rows[0].five_star}`);
    console.log(`   4★: ${stats.rows[0].four_star}`);
    console.log(`   3★: ${stats.rows[0].three_star}`);
    console.log(`   2★: ${stats.rows[0].two_star}`);
    console.log(`   1★: ${stats.rows[0].one_star}`);
    
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    
    // Check if reviews table exists
    try {
      const tableCheck = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'reviews'
        )`
      );
      
      if (!tableCheck.rows[0].exists) {
        console.error('\n❌ The "reviews" table does not exist in the database!');
        console.log('   Please run your init.sql to create the reviews table:');
        console.log('   node src/db/init.js');
      }
    } catch (e) {
      console.error('Could not check if reviews table exists:', e.message);
    }
  } finally {
    process.exit();
  }
}

// Run the seed function
seedReviews();