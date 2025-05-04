import React from 'react';

function Wrapper({ children }) {
    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            {children}
        </div>
    );
}

export default Wrapper;
