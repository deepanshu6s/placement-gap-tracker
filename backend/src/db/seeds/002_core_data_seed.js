const { pool } = require('../../config/db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Career Roles
    const role1 = await client.query(`
      INSERT INTO career_roles (name, description, is_active)
      VALUES ('Software Engineer', 'Develops and maintains software applications', true)
      ON CONFLICT (name) DO UPDATE SET is_active = true
      RETURNING id
    `);
    
    const role2 = await client.query(`
      INSERT INTO career_roles (name, description, is_active)
      VALUES ('Data Analyst', 'Analyzes and interprets complex data sets', true)
      ON CONFLICT (name) DO UPDATE SET is_active = true
      RETURNING id
    `);

    const seId = role1.rows[0].id;
    const daId = role2.rows[0].id;

    // 2. Skills
    const skillsToInsert = [
      { name: 'JavaScript', category: 'technical' },
      { name: 'React', category: 'technical' },
      { name: 'SQL', category: 'technical' },
      { name: 'Python', category: 'technical' },
      { name: 'Data Visualization', category: 'domain' }
    ];

    const skillIds = {};
    for (const s of skillsToInsert) {
      const res = await client.query(`
        INSERT INTO skills (name, category, is_active)
        VALUES ($1, $2, true)
        ON CONFLICT (name) DO UPDATE SET is_active = true
        RETURNING id
      `, [s.name, s.category]);
      skillIds[s.name] = res.rows[0].id;
    }

    // 3. Role Skill Requirements
    // Software Engineer
    await client.query(`
      INSERT INTO role_skill_requirements (role_id, skill_id, required_level, weight)
      VALUES ($1, $2, 80, 5) ON CONFLICT DO NOTHING
    `, [seId, skillIds['JavaScript']]);
    await client.query(`
      INSERT INTO role_skill_requirements (role_id, skill_id, required_level, weight)
      VALUES ($1, $2, 70, 4) ON CONFLICT DO NOTHING
    `, [seId, skillIds['React']]);
    await client.query(`
      INSERT INTO role_skill_requirements (role_id, skill_id, required_level, weight)
      VALUES ($1, $2, 60, 3) ON CONFLICT DO NOTHING
    `, [seId, skillIds['SQL']]);

    // Data Analyst
    await client.query(`
      INSERT INTO role_skill_requirements (role_id, skill_id, required_level, weight)
      VALUES ($1, $2, 80, 5) ON CONFLICT DO NOTHING
    `, [daId, skillIds['SQL']]);
    await client.query(`
      INSERT INTO role_skill_requirements (role_id, skill_id, required_level, weight)
      VALUES ($1, $2, 75, 4) ON CONFLICT DO NOTHING
    `, [daId, skillIds['Python']]);
    await client.query(`
      INSERT INTO role_skill_requirements (role_id, skill_id, required_level, weight)
      VALUES ($1, $2, 70, 3) ON CONFLICT DO NOTHING
    `, [daId, skillIds['Data Visualization']]);

    // 4. Assessment Configs
    for (const skillName of Object.keys(skillIds)) {
      await client.query(`
        INSERT INTO assessment_configs (skill_id, total_questions, time_limit_minutes, easy_count, medium_count, hard_count, cooldown_hours)
        VALUES ($1, 3, 5, 1, 1, 1, 24)
        ON CONFLICT (skill_id) DO UPDATE SET total_questions = 3
      `, [skillIds[skillName]]);
    }

    // 5. Questions and Options for JavaScript
    const q1 = await client.query(`
      INSERT INTO questions (skill_id, question_text, difficulty)
      VALUES ($1, 'What is the output of typeof null?', 'easy')
      RETURNING id
    `, [skillIds['JavaScript']]);
    const q1Id = q1.rows[0].id;
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'object', true, 1)`, [q1Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'null', false, 2)`, [q1Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'undefined', false, 3)`, [q1Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'number', false, 4)`, [q1Id]);

    const q2 = await client.query(`
      INSERT INTO questions (skill_id, question_text, difficulty)
      VALUES ($1, 'Which method is used to serialize an object into a JSON string?', 'medium')
      RETURNING id
    `, [skillIds['JavaScript']]);
    const q2Id = q2.rows[0].id;
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'JSON.stringify()', true, 1)`, [q2Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'JSON.parse()', false, 2)`, [q2Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'JSON.serialize()', false, 3)`, [q2Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'Object.toJSON()', false, 4)`, [q2Id]);

    const q3 = await client.query(`
      INSERT INTO questions (skill_id, question_text, difficulty)
      VALUES ($1, 'What is a closure in JavaScript?', 'hard')
      RETURNING id
    `, [skillIds['JavaScript']]);
    const q3Id = q3.rows[0].id;
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'A function bundled with its lexical environment', true, 1)`, [q3Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'A way to close browser tabs', false, 2)`, [q3Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'A method to end execution of a loop', false, 3)`, [q3Id]);
    await client.query(`INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES ($1, 'A syntax error', false, 4)`, [q3Id]);

    await client.query('COMMIT');
    console.log('Core data seed completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Core data seed failed', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
