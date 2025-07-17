'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Social Media Ad Preview Tool
          </h1>
          <p className="text-gray-600">
            Preview your ads across all major social platforms with safety zone validation
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="text-4xl mb-4">🎬</div>
          <h2 className="text-xl font-semibold mb-2">Coming Soon!</h2>
          <p className="text-gray-600">
            The full Ad Preview Tool is being deployed. This is a minimal version to test the build process.
          </p>
        </div>
      </div>
    </div>
  );
}