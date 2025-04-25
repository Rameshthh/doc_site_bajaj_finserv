import type { Doctor } from "@/types"

interface DoctorListProps {
  doctors: Doctor[]
}

export default function DoctorList({ doctors }: DoctorListProps) {
  if (doctors.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          data-testid="doctor-card"
          className="bg-white p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Doctor Image */}
            <div className="sm:w-1/6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto sm:mx-0 overflow-hidden">
                {doctor.image ? (
                  <img
                    src={doctor.image || "/placeholder.svg"}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      const target = e.target as HTMLImageElement
                      target.onerror = null // Prevent infinite loop
                      target.src = `/placeholder.svg?height=200&width=200&query=doctor ${doctor.name}`
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
            </div>

            {/* Doctor Information */}
            <div className="sm:w-3/6 flex flex-col justify-start">
              {/* Doctor Name and Primary Info */}
              <h3 data-testid="doctor-name" className="text-lg font-semibold mb-1">
                Dr. {doctor.name}
              </h3>

              <div className="mb-1">
                <span data-testid="doctor-specialty" className="text-gray-600">
                  {doctor.specialties && doctor.specialties.length > 0 ? doctor.specialties[0] : "General Physician"}
                </span>
              </div>

              {doctor.qualifications && <div className="text-sm text-gray-600 mb-1">{doctor.qualifications}</div>}

              <div className="text-sm text-gray-600 mb-3">{doctor.experience} yrs exp.</div>

              {/* Clinic Name with Building Emoji */}
              {doctor.clinicName && (
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <span className="mr-1">🏥</span>
                  <span>{doctor.clinicName}</span>
                </div>
              )}

              {/* Locality with Location Pin */}
              {doctor.locality && (
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{doctor.locality}</span>
                </div>
              )}
            </div>

            {/* Fee and Book Appointment */}
            <div className="sm:w-2/6 flex flex-col justify-between items-end mt-4 sm:mt-0">
              <div className="text-xl font-bold text-gray-800 mb-3" data-testid="doctor-fee">
                ₹ {doctor.fees}
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors w-full sm:w-auto">
                Book Appointment
              </button>
            </div>
          </div>

          {/* Consultation Mode Tags at Bottom */}
          {(doctor.videoConsult || doctor.inClinic) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              {doctor.videoConsult && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">Video Consultation</span>
              )}
              {doctor.inClinic && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">In-clinic Consultation</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
