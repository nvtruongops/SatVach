import type { Component } from 'solid-js';

const App: Component = () => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <header class="p-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Sát Vách
        </h1>
        <p class="text-slate-400 mt-2">Bản đồ địa điểm địa phương</p>
      </header>
      
      <main class="flex-1 p-6">
        <div class="rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 p-8 text-center">
          <p class="text-slate-300">
            🗺️ Map component will be loaded here
          </p>
          <p class="text-slate-500 text-sm mt-2">
            Setup complete! Ready for development.
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
