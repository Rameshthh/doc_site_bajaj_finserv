"use client"

import { useCallback, useEffect } from "react"
import type { Doctor } from "@/types"

interface FilterPanelProps {
  doctors: Doctor[]
  consultationType: string
  specialties: string[]
  sortBy: string
  onFilterChange: (type: string, value: string | string[]) => void
}

export default function FilterPanel({
  doctors,
  consultationType,
  specialties,
  sortBy,
  onFilterChange,
}: FilterPanelProps) {
  // This will allow the FilterPanel to respond to the Clear All action
  useEffect(() => {
    // This effect runs when the URL parameters change
    // If all parameters are empty, it means filters were cleared
    if (consultationType === "" && specialties.length === 0 && sortBy === "") {
      // Reset any internal state if needed
      console.log("FilterPanel detected all filters cleared")
    }
  }, [consultationType, specialties, sortBy])

  // Required specialties for testing
  const requiredSpecialties = [
    "General Physician",
    "Dentist",
    "Dermatologist",
    "Paediatrician",
    "Gynaecologist",
    "ENT",
    "Diabetologist",
    "Cardiologist",
    "Physiotherapist",
    "Endocrinologist",
    "Orthopaedic",
    "Ophthalmologist",
    "Gastroenterologist",
    "Pulmonologist",
    "Psychiatrist",
    "Urologist",
    "Dietitian/Nutritionist",
    "Psychologist",
    "Sexologist",
    "Nephrologist",
    "Neurologist",
    "Oncologist",
    "Ayurveda",
    "Homeopath",
  ]

  // Extract unique specialties from all doctors
  const extractedSpecialties = (() => {
    const specialtiesSet = new Set<string>()

    doctors.forEach((doctor) => {
      if (doctor.specialties && Array.isArray(doctor.specialties)) {
        doctor.specialties.forEach((specialty) => {
          if (specialty) specialtiesSet.add(specialty)
        })
      }
    })

    return Array.from(specialtiesSet)
  })()

  // Combine extracted and required specialties, removing duplicates
  const allSpecialties = [...new Set([...requiredSpecialties, ...extractedSpecialties])].sort()

  const handleConsultationTypeChange = useCallback(
    (type: string) => {
      onFilterChange("consultationType", type === consultationType ? "" : type)
    },
    [consultationType, onFilterChange],
  )

  const handleSpecialtyChange = useCallback(
    (specialty: string) => {
      let newSpecialties: string[]

      if (specialties.includes(specialty)) {
        newSpecialties = specialties.filter((s) => s !== specialty)
      } else {
        newSpecialties = [...specialties, specialty]
      }

      onFilterChange("specialties", newSpecialties)
    },
    [specialties, onFilterChange],
  )

  const handleSortChange = useCallback(
    (sort: string) => {
      onFilterChange("sortBy", sort === sortBy ? "" : sort)
    },
    [sortBy, onFilterChange],
  )

  return (
    <div>
      {/* Sort Options */}
      <div className="mb-6">
        <h3 data-testid="filter-header-sort" className="font-medium mb-3 text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
          Sort by
        </h3>
        <div className="space-y-2 pl-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              data-testid="sort-fees"
              type="radio"
              checked={sortBy === "fees-low-to-high"}
              onChange={() => handleSortChange("fees-low-to-high")}
              className="form-radio text-blue-600"
              name="sort"
            />
            <span className="text-gray-700">Price: Low-High</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              data-testid="sort-experience"
              type="radio"
              checked={sortBy === "experience"}
              onChange={() => handleSortChange("experience")}
              className="form-radio text-blue-600"
              name="sort"
            />
            <span className="text-gray-700">Experience: Most Experience first</span>
          </label>
          {/* Add this hidden input to handle the "no selection" state */}
          <input type="radio" className="hidden" checked={sortBy === ""} onChange={() => {}} name="sort" />
        </div>
      </div>

      {/* Consultation Type Filter */}
      <div className="mb-6">
        <h3 data-testid="filter-header-moc" className="font-medium mb-3 text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Mode of consultation
        </h3>
        <div className="space-y-2 pl-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              data-testid="filter-video-consult"
              type="radio"
              checked={consultationType === "Video Consult"}
              onChange={() => handleConsultationTypeChange("Video Consult")}
              className="form-radio text-blue-600"
              name="consultationType"
            />
            <span className="text-gray-700">Video Consultation</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              data-testid="filter-in-clinic"
              type="radio"
              checked={consultationType === "In Clinic"}
              onChange={() => handleConsultationTypeChange("In Clinic")}
              className="form-radio text-blue-600"
              name="consultationType"
            />
            <span className="text-gray-700">In-clinic Consultation</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={consultationType === ""}
              onChange={() => handleConsultationTypeChange("")}
              className="form-radio text-blue-600"
              name="consultationType"
            />
            <span className="text-gray-700">All</span>
          </label>
        </div>
      </div>

      {/* Specialties Filter */}
      <div className="mb-6">
        <h3 data-testid="filter-header-speciality" className="font-medium mb-3 text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          Specialities
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pl-2">
          {allSpecialties.map((specialty) => {
            // Convert specialty to the format needed for data-testid
            // Ensure specialty is a string before calling replace
            const specialtyId =
              typeof specialty === "string"
                ? specialty.replace(/\s+/g, "-").replace(/\//g, "-")
                : String(specialty).replace(/\s+/g, "-").replace(/\//g, "-")

            // Ensure specialty is displayed as a string
            const specialtyDisplay = typeof specialty === "string" ? specialty : JSON.stringify(specialty)

            return (
              <label key={String(specialty)} className="flex items-center space-x-2 cursor-pointer">
                <input
                  data-testid={`filter-specialty-${specialtyId}`}
                  type="checkbox"
                  checked={specialties.includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                  className="form-checkbox text-blue-600 rounded"
                />
                <span className="text-gray-700">{specialtyDisplay}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
