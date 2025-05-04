import LeftBar from '~/components/Layout/DefaultLayout/Header';

import avt from '~/assets/imgs/default-avatar.webp';

function UserPage() {
  return (
    <div className="user-page min-h-screen bg-black">
      <LeftBar />
      <div className="max-w-screen min-h-screen mx-64 px-40 bg-black text-white pt-8">
        <div
          className="user-info-wrapper flex w-full relative pb-6
            before:content-[''] before:absolute before:w-full before:h-px before:top-auto before:bottom-0 before:right-0 before:bg-slate-300  before:opacity-20"
        >
          <div className="img-wrapper mr-8 px-4">
            <img src={avt} alt="avt" className="w-36 h-36 rounded-full" />
          </div>
          <div className="user-info ">
            <div className="flex mb-2">
              <h2 className="user-name mr-8">User Name</h2>
              <button className="follow-btn mr-3 bg-neutral-600 py-1 px-4 rounded-md">Theo dõi</button>
              <button className="texting-btn bg-neutral-600 py-1 px-4 rounded-md">Nhắn tin</button>
            </div>
            <div className="flex">
              <p className="mr-6">0 bài viết</p>
              <p className="mr-6">0 người theo dõi</p>
              <p className="">Đang theo dõi 0 người</p>
            </div>
          </div>
        </div>
        <div className='mt-2'>
            <p className='my-1'>Bài viết</p>
            <div className=''>
                <img src={avt} alt='avt' className='float-left w-1/3 pr-1.5 pb-4'/>
                <img src={avt} alt='avt' className='float-left w-1/3 pr-1.5 pb-4'/>
                <img src={avt} alt='avt' className='float-left w-1/3 pr-1.5 pb-4'/>
                <img src={avt} alt='avt' className='float-left w-1/3 pr-1.5 pb-4'/>
                <img src={avt} alt='avt' className='float-left w-1/3 pr-1.5 pb-4'/>
            </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;
