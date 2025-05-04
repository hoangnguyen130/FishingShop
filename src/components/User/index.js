import { useState } from 'react';
import defaultAvt from '~/assets/imgs/default-avatar.webp';

function User({ data }) {
  const [avt, setAvt] = useState(false);
  return (
    <div>
      <div className="user flex flex-row w-full h-8">
        {avt ? (
          <img src={avt} alt="user img" className="w-8 h-8 rounded-2xl cursor-pointer" />
        ) : (
          <img src={defaultAvt} alt="user img" className="w-8 h-8 rounded-2xl cursor-pointer" />
        )}
        <h5 className="user-name h-full pl-3 py-1 text-sm font-medium cursor-pointer">{data}</h5>
      </div>
    </div>
  );
}

export default User;
