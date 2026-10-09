const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create admin
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin_password', salt);
    const adminRes = await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      ['admin@college.edu', adminHash]
    );

    // Create Faculty
    const facHash = await bcrypt.hash('faculty_password', salt);
    const facRes = await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'faculty')
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      ['faculty@college.edu', facHash]
    );

    if (facRes.rows.length > 0) {
      const facId = facRes.rows[0].id;
      const facProf = await client.query(
        `INSERT INTO faculty_profiles (user_id, full_name, department, is_tpo)
         VALUES ($1, 'John Faculty', 'Computer Science', false) RETURNING id`,
        [facId]
      );
      
      await client.query(
        `INSERT INTO faculty_batch_scope (faculty_profile_id, batch_year, branch)
         VALUES ($1, 2024, 'CS')`,
        [facProf.rows[0].id]
      );
    }

    // Create TPO
    const tpoHash = await bcrypt.hash('tpo_password', salt);
    const tpoRes = await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'faculty')
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      ['tpo@college.edu', tpoHash]
    );

    if (tpoRes.rows.length > 0) {
      const tpoId = tpoRes.rows[0].id;
      await client.query(
        `INSERT INTO faculty_profiles (user_id, full_name, department, is_tpo)
         VALUES ($1, 'Jane TPO', 'Placement Cell', true) RETURNING id`,
        [tpoId]
      );
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
