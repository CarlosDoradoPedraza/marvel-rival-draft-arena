import React from 'react';

interface PopupNotificationProps {
  content: string | null;
  onClose: () => void;
}

const PopupNotification: React.FC<PopupNotificationProps> = ({ content, onClose }) => {
  if (!content) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <p className="text-lg font-medium text-gray-800">{content}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default PopupNotification;