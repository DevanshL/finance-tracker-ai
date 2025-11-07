import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';
import TransactionModal from '../transactions/TransactionModal';

function QuickActions() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Add Transaction Button */}
        <button
          onClick={() => setIsTransactionModalOpen(true)}
          className="btn-primary btn-sm hidden sm:flex"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>

        {/* User Menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name}
            </span>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/dashboard"
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      <ChartBarIcon className="mr-2 h-5 w-5" />
                      Dashboard
                    </Link>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/transactions"
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      <PlusIcon className="mr-2 h-5 w-5" />
                      Transactions
                    </Link>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/settings"
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      <Cog6ToothIcon className="mr-2 h-5 w-5" />
                      Settings
                    </Link>
                  )}
                </Menu.Item>
              </div>

              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-red-50 dark:bg-red-900/20' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </>
  );
}

export default QuickActions;