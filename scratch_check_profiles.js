const db = require('./backend/src/config/db');

async function check() {
  try {
    const cols = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('faculty_profiles', 'student_profiles')
      ORDER BY table_name, ordinal_position;
    `);
    console.log('Columns:', cols.rows);

    const fac = await db.query(`SELECT * FROM faculty_profiles`);
    console.log('Faculty Profiles:', fac.rows);

    const stu = await db.query(`SELECT * FROM student_profiles`);
    console.log('Student Profiles:', stu.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

check();
