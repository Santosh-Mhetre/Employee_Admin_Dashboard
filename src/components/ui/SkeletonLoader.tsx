import React from 'react';

interface SkeletonCardProps {
  rows?: number;
  columns?: number;
  title?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  rows = 3, 
  columns = 4,
  title = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {title && (
        <div className="flex items-center mb-4">
          <div className="h-5 w-5 rounded-full bg-gray-200 mr-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      )}
      
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
        {Array(rows * columns).fill(0).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 6
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-5 w-5 rounded-full bg-gray-200 mr-2"></div>
          <div className="h-6 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-28"></div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array(columns).fill(0).map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array(rows).fill(0).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array(columns).fill(0).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface SkeletonHeaderProps {
  hasActions?: boolean;
}

export const SkeletonHeader: React.FC<SkeletonHeaderProps> = ({ hasActions = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        
        {hasActions && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SkeletonBreadcrumbProps {
  levels?: number;
}

export const SkeletonBreadcrumb: React.FC<SkeletonBreadcrumbProps> = ({ levels = 3 }) => {
  return (
    <div className="flex items-center text-sm text-gray-600 mb-4">
      {Array(levels).fill(0).map((_, index) => (
        <React.Fragment key={index}>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          {index < levels - 1 && <span className="mx-2">/</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function SkeletonLoader() {
  return (
    <>
      <SkeletonBreadcrumb />
      <SkeletonHeader />
      <SkeletonCard />
      <SkeletonTable />
    </>
  );
} 