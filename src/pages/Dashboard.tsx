import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogOut, User, Mail, Calendar, Shield } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const joinDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <h1 className="text-white text-xl font-bold">MemberHub</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-xl p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome, {user?.user_metadata?.name || user?.email}! 👋
              </h2>
              <p className="text-gray-400 mb-6">
                You're all set up and ready to go. Start exploring the platform and connect with our community.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Explore Community
                </Button>
                <Button className="bg-slate-700 hover:bg-slate-600 text-white">
                  View Guide
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-xl p-8"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
                100%
              </div>
              <p className="text-gray-400 text-sm mb-4">Account Security</p>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Verified & Secure</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* User Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-xl p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email Address</p>
                <p className="text-white font-medium break-all">{user?.email}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">User ID</p>
                <p className="text-white font-medium text-xs break-all">{user?.id}</p>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Member Since</p>
                <p className="text-white font-medium">{joinDate}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Real-time Collaboration',
                description: 'Work together with team members in real-time',
              },
              {
                title: 'Advanced Analytics',
                description: 'Track metrics and monitor performance',
              },
              {
                title: 'Secure Authentication',
                description: 'Enterprise-grade security with encryption',
              },
              {
                title: 'Community Hub',
                description: 'Connect with millions of users worldwide',
              },
              {
                title: '24/7 Support',
                description: 'Get help anytime from our support team',
              },
              {
                title: 'Custom Integrations',
                description: 'Integrate with your favorite tools',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition"
              >
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
