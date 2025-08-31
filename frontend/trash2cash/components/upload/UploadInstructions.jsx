"use client";

export function UploadInstructions() {
  return (
    <div className="mb-10 p-8 rounded-2xl shadow-lg border border-white/30 bg-white/70 backdrop-blur-md">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
        How It Works
      </h2>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Step 1 */}
        <div className="flex-1 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 text-xl font-bold mb-3">
            1
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Upload Photo
          </h3>
          <p className="text-gray-600">
            Take a clear photo of your item and provide some basic details
          </p>
        </div>

        <div className="hidden md:block text-gray-400 pt-6 text-2xl font-light">
          →
        </div>

        {/* Step 2 */}
        <div className="flex-1 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 text-xl font-bold mb-3">
            2
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Select Centre
          </h3>
          <p className="text-gray-600">
            Choose a recycling centre that is convenient for you
          </p>
        </div>

        <div className="hidden md:block text-gray-400 pt-6 text-2xl font-light">
          →
        </div>

        {/* Step 3 */}
        <div className="flex-1 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 text-xl font-bold mb-3">
            3
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Book Appointment
          </h3>
          <p className="text-gray-600">
            Schedule a pickup or drop-off time that works for you
          </p>
        </div>
      </div>
    </div>
  );
}
