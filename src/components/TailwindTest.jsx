import React from 'react';

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Tailwind CSS Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              Colors & Text
            </h2>
            <p className="text-gray-600 mb-2">This text should be gray-600</p>
            <p className="text-blue-500 font-medium">
              This text should be blue-500 and bold
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Gradients</h2>
            <p>This card has a green to blue gradient background</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">
              Hover Effects
            </h2>
            <p className="text-gray-600">
              Hover this card to see shadow change
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Spacing & Layout Test
          </h2>

          <div className="space-y-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Primary Button
            </button>

            <button className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200">
              Secondary Button
            </button>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-indigo-500 rounded-full"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Flex Layout</h3>
                <p className="text-gray-600 text-sm">
                  This should be properly spaced
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            If you can see proper styling, colors, spacing, and hover effects,
            Tailwind is working correctly!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
