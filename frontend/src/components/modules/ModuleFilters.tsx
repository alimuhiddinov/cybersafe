import React, { useState, useEffect } from 'react';
import { ModuleFiltersType } from '../../pages/modules/index';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type ModuleFiltersProps = {
  filters: ModuleFiltersType;
  onApplyFilters: (filters: ModuleFiltersType) => void;
};

const ModuleFilters: React.FC<ModuleFiltersProps> = ({ filters, onApplyFilters }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Local filter state for form handling
  const [localFilters, setLocalFilters] = useState<ModuleFiltersType>(filters);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  
  // Update local filters when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle filter application
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
    if (window.innerWidth < 768) {
      setIsFiltersOpen(false);
    }
  };
  
  // Handle filter reset
  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      difficulty: '',
      status: '',
      sort: 'newest'
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          type="button"
          className="w-full flex items-center justify-between p-2 text-gray-700 bg-gray-50 rounded-md"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        >
          <span className="font-medium">Filters</span>
          <svg
            className={`h-5 w-5 transition-transform ${isFiltersOpen ? 'transform rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      
      {/* Filter form */}
      <div className={`${isFiltersOpen || window.innerWidth >= 768 ? 'block' : 'hidden'} md:block`}>
        <form onSubmit={handleApplyFilters}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search filter */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={localFilters.search}
                onChange={handleInputChange}
                placeholder="Search modules..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Difficulty filter */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={localFilters.difficulty}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
            
            {/* Status filter - only for authenticated users */}
            {isAuthenticated && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={localFilters.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            )}
            
            {/* Sort filter */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                value={localFilters.sort}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">Title (A-Z)</option>
                <option value="z-a">Title (Z-A)</option>
                <option value="easiest">Easiest First</option>
                <option value="hardest">Hardest First</option>
              </select>
            </div>
          </div>
          
          {/* Filter action buttons */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Reset Filters
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleFilters;
