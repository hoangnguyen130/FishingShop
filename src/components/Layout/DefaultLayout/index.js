import React from 'react';
import Header from './Header';

function DefaultLayout({ children }) {
    return ( 
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="">
                {children}
            </main>
        </div>
     );
}

export default DefaultLayout;