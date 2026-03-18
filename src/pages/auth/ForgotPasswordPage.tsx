import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="We'll help you regain access to your account"
      image="https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=500&h=700&fit=crop"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
