import React from 'react'

const LandingSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center space-y-4">
        <div className="h-8 w-48 bg-gray-300 rounded mx-auto" />
        <div className="h-6 w-64 bg-gray-200 rounded mx-auto" />
        <div className="h-10 w-40 bg-gray-300 rounded mx-auto" />
      </div>
    </div>
  )
}

export default LandingSkeleton
