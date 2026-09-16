<Card
  key={c.id}
  className={`p-4 cursor-pointer transition ${
    selectedStudent?.id === c.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
  }`}
  onClick={() => {
    setSelectedStudent(c);
    loadMessages(c.id);
  }}
>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
      {(c.username || 'S').charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        <p className="font-semibold text-slate-800 truncate">{c.username}</p>
        {c.role && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
            c.role === 'mentor' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {c.role}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 truncate">{c.last_message || 'No messages yet'}</p>
    </div>
  </div>
</Card>