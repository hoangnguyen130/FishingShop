import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import defaultAvt from '~/assets/imgs/default-avatar.webp'

const ContactList = ({ contacts, onSelectContact }) => {
  const navigate = useNavigate();
  const handleBackToHome = () => {
    navigate('/');
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center cursor-pointer" onClick={handleBackToHome}>
        <FontAwesomeIcon icon={faChevronLeft} />
        <p className="px-2">Về Trang chủ</p>
      </div>
      {contacts.map((contact) => (
        <div
          key={contact._id}
          onClick={() => onSelectContact(contact.contactId)}
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-3 rounded-md"
        >
          {contact.avatar ? (
            <img className="w-10 h-10 rounded-full" src={contact.avatar} alt={contact.name} />
          ) : (
            <img className="w-10 h-10 rounded-full" src={defaultAvt} alt={contact.name} />
          )}
          <div>
            <p className="font-semibold">{contact.name}</p>
            <p className="text-sm text-gray-400">{contact.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
