import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1E3A8A] font-bold text-2xl tracking-tight">
          <BrainCircuit size={32} />
          AttendAI
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button onClick={() => navigate('/login')}>
            Get Started
          </Button>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 py-20 text-center max-w-4xl">
          <Badge variant="neutral">🚀 The Future of EdTech</Badge>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mt-6 leading-tight">
            Intelligent Attendance for{' '}
            <span className="text-[#1E3A8A]">Schools & Universities</span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate manual roll calls. Dual-mode system utilizing high-speed facial 
            recognition for schools and dynamic QR + Face verification for large university lectures.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => navigate('/login')} 
              className="px-8 py-4 text-lg w-full sm:w-auto"
            >
              Portal Login
            </Button>
          </div>

          <div className="mt-20 relative mx-auto w-full max-w-5xl rounded-xl border border-gray-200 shadow-2xl overflow-hidden bg-white">
            <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
              alt="Dashboard Preview" 
              className="w-full object-cover opacity-90 grayscale-[20%]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
