import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const SignOut = ({ isOpen, onClose, onLogout }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-lg shadow-lg p-6 w-96 mx-auto my-20"
      overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
    >
      <h2 className="text-xl font-semibold mb-4">Bạn có chắc chắn muốn đăng xuất?</h2>
      <div className="flex justify-end gap-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
          onClick={onClose}
        >
          Hủy
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={onLogout}
        >
          Đăng xuất
        </button>
      </div>
    </Modal>
  );
};

export default SignOut;
