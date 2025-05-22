'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiUsers, FiBriefcase } from 'react-icons/fi';
import { getEmployees, getEmployments } from '@/utils/firebaseUtils';
import { Employee, Employment } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

export default function DashboardPage() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [employmentCount, setEmploymentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employees = await getEmployees();
        const employments = await getEmployments();
        
        setEmployeeCount(employees.length);
        setEmploymentCount(employments.length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: 'Employees',
      count: employeeCount,
      icon: <FiUsers className="w-8 h-8 text-blue-500" />,
      link: '/employees',
      color: 'bg-blue-50'
    }
  ];

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-slate-700">Welcome to the admin dashboard</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {cards.map((card) => (
            <Link
              href={card.link}
              key={card.title}
              className={`${card.color} p-3 rounded-md shadow-sm hover:shadow-md transition-shadow max-w-xs w-full`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-700 font-medium text-sm">{card.title}</p>
                  <h3 className="text-xl font-bold mt-1 text-gray-800">{card.count}</h3>
                </div>
                <div>
                  {card.icon &&
                    <span className="w-6 h-6 text-blue-500">{card.icon}</span>
                  }
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mt-12">
          <Link
            href="/employees/add"
            className="bg-white p-3 rounded-md shadow-sm hover:shadow-md transition-shadow border border-gray-200 max-w-xs w-full"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-slate-800 font-medium">Add New Employee</span>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
} 