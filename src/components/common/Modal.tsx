import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center text-center tablet:items-center tablet:justify-center tablet:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full tablet:translate-y-0 tablet:scale-95"
              enterTo="opacity-100 translate-y-0 tablet:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 tablet:scale-100"
              leaveTo="opacity-0 translate-y-full tablet:translate-y-0 tablet:scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  'w-full transform overflow-hidden bg-white text-left align-middle shadow-xl transition-all',
                  'rounded-t-2xl rounded-b-none tablet:rounded-2xl',
                  'max-h-[90vh] tablet:max-h-[85vh]',
                  sizeClasses[size]
                )}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between px-4 py-4 tablet:px-6 border-b border-gray-200">
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-gray-900"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    {showCloseButton && (
                      <button
                        type="button"
                        className="ml-auto inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="px-4 py-4 tablet:px-6 overflow-y-auto max-h-[calc(90vh-120px)] tablet:max-h-[calc(85vh-120px)]">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
