import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const RegisterPage = () => {
  return (
    <Card
      title="Student Registration"
      subtitle="Phase 1 Structural Placeholder (Owned by Member 1)"
    >
      <div className="space-y-4">
        <Alert variant="info">
          Student registration is planned for Phase 2. Per decision PHA-15, public self-registration
          is strictly for students; faculty accounts are seeded.
        </Alert>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <Input id="name" label="Full Name" placeholder="Student Name" disabled />
          <Input
            id="email"
            label="College Email"
            type="email"
            placeholder="student@college.edu"
            disabled
          />
          <Input
            id="password"
            label="Create Password"
            type="password"
            placeholder="••••••••"
            disabled
          />
          <Button variant="primary" className="w-full" disabled>
            Register Student (Planned Phase 2)
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Login Portal (Placeholder)
          </Link>
        </div>
      </div>
    </Card>
  );
};
