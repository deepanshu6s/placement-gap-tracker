import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const LoginPage = () => {
  return (
    <Card
      title="Student / Faculty Login"
      subtitle="Phase 1 Structural Placeholder (Owned by Member 1)"
    >
      <div className="space-y-4">
        <Alert variant="info">
          Authentication is planned for Phase 2. This route serves as a router structural
          verification point.
        </Alert>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <Input
            id="email"
            label="College Email"
            type="email"
            placeholder="student@college.edu"
            disabled
          />
          <Input id="password" label="Password" type="password" placeholder="••••••••" disabled />
          <Button variant="primary" className="w-full" disabled>
            Login (Planned Phase 2)
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Need an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Register Portal (Placeholder)
          </Link>
        </div>
      </div>
    </Card>
  );
};
