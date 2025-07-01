import { useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';

const animationVariants = {
  fadeInOut: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.85 }
  },
  // Additional animation types can be defined here
};

const CustomModal = ({
  title,
  visible,
  onClose,
  children,
  widthPercentage,
  titleClassName,
  modalClassName,
  footerElement
}) => {

  const [showModal, setShowModal] = useState(true);
  useEffect(() => {
    if (!showModal) {
      setTimeout(onClose, 300); // Delay onClose to allow exit animation to complete
    }
  }, [visible, onClose, showModal]);

  const modalWidth = {
    '20': 'w-full sm:w-screen md:w-2/5 lg:w-1/3 xl:w-1/4',
    '80': 'w-full sm:w-screen md:w-4/5 lg:w-3/4 xl:w-2/3'
  }[widthPercentage] || 'w-full sm:w-screen md:w-3/5 lg:w-2/3 xl:w-1/2';

  const animationType = process.env.NEXT_PUBLIC_MODAL_ANIMATION || 'fadeInOut';

  return (
    <>
      {visible && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
        >
          <AnimatePresence>
            {showModal && (
              <motion.div
                className={`flex flex-col p-4 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-700 h-full md:h-auto ${modalWidth} ${modalClassName}`}
                onClick={(e) => e.stopPropagation()}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                variants={animationVariants[animationType]}
              >
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-medium text-gray-900 dark:text-white ${titleClassName}`}>{title}</h2>
                  <button
                    onClick={() => setShowModal(false)} // Update this to match your state control logic
                    aria-label="Close"
                    className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1 w-8 h-8 text-sm ml-auto dark:hover:bg-gray-600 dark:hover:text-white shadow-effect"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-grow mt-4">{children}</div>
                <div className="mt-4">{footerElement}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default CustomModal;
