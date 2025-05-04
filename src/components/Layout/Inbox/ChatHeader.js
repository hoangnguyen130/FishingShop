function ChatHeader() {
  return (
    <div className="bg-black text-white flex items-center justify-between p-4 border-b border-slate-700">
      <div className="flex items-center">
        <img
          src="https://via.placeholder.com/40"
          alt="User Avatar"
          className="rounded-full w-10 h-10"
        />
        <span className="ml-2 text-lg font-semibold">John Doe</span>
      </div>
      <button className="text-gray-500 text-xl">...</button>
    </div>
  );
};

export default ChatHeader;
