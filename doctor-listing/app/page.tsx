"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DoctorList from "@/components/doctor-list"
import FilterPanel from "@/components/filter-panel"
import SearchBar from "@/components/search-bar"
import type { Doctor } from "@/types"

export default function Home() {
  // State for the original list of doctors from the API
  const [doctors, setDoctors] = useState<Doctor[]>([])
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Get filters from URL
  const searchQuery = searchParams.get("search") || ""
  const consultationType = searchParams.get("consultationType") || ""
  const specialties = searchParams.get("specialties")?.split(",").filter(Boolean) || []
  const sortBy = searchParams.get("sortBy") || ""

  // Function to normalize doctor data
  function normalizeDoctor(doctor: any): Doctor {
    console.log("Raw doctor data:", doctor) // Log the raw data to see its structure

    // Get image from photo, logo_url, or generate a placeholder
    let imageUrl = null
    if (doctor.photo) {
      imageUrl = doctor.photo
    } else if (doctor.logo_url) {
      imageUrl = doctor.logo_url
    } else {
      // Generate a placeholder image with the doctor's name
      imageUrl = `/placeholder.svg?height=200&width=200&query=doctor ${doctor.name}`
    }

    // Ensure specialties is an array of strings
    let specialtiesArray: string[] = []

    if (doctor.specialities) {
      specialtiesArray = Array.isArray(doctor.specialities)
        ? doctor.specialities.map((s: any) => (typeof s === "string" ? s : s.name || JSON.stringify(s)))
        : [
            typeof doctor.specialities === "string"
              ? doctor.specialities
              : doctor.specialities.name || JSON.stringify(doctor.specialities),
          ]
    } else if (doctor.specialties) {
      specialtiesArray = Array.isArray(doctor.specialties)
        ? doctor.specialties.map((s: any) => (typeof s === "string" ? s : s.name || JSON.stringify(s)))
        : [
            typeof doctor.specialties === "string"
              ? doctor.specialties
              : doctor.specialties.name || JSON.stringify(doctor.specialties),
          ]
    }

    // Get fees from the fees tag
    let fees = 0
    if (doctor.fees !== undefined) {
      // If fees is a string with a rupee sign, remove it and convert to number
      if (typeof doctor.fees === "string") {
        fees = Number.parseInt(doctor.fees.replace(/[₹,\s]/g, ""), 10) || 0
      } else {
        fees = doctor.fees || 0
      }
    }

    // Get experience from the experience tag
    let experience = 0
    if (doctor.experience !== undefined) {
      if (typeof doctor.experience === "string") {
        // Extract numbers from strings like "5 years"
        const match = doctor.experience.match(/\d+/)
        experience = match ? Number.parseInt(match[0], 10) : 0
      } else {
        experience = doctor.experience || 0
      }
    }

    // Get clinic name from clinic.name
    let clinicName = ""
    if (doctor.clinic && doctor.clinic.name) {
      clinicName = doctor.clinic.name
    }

    // Get locality from the locality tag
    let locality = ""
    if (doctor.locality) {
      locality = doctor.locality
    } else if (doctor.location) {
      locality = doctor.location
    } else if (doctor.address) {
      locality = doctor.address
    } else if (doctor.clinic && doctor.clinic.locality) {
      locality = doctor.clinic.locality
    }

    // Log the locality for debugging
    console.log(`Doctor ${doctor.name} locality:`, locality)

    // Get qualifications
    let qualifications = ""
    if (doctor.qualifications) {
      qualifications = doctor.qualifications
    } else if (doctor.education) {
      qualifications = doctor.education
    }

    return {
      id: doctor.id || Math.random().toString(36).substr(2, 9),
      name: doctor.name || "Unknown Doctor",
      specialties: specialtiesArray,
      experience: experience,
      fees: fees,
      videoConsult: !!doctor.video_consult,
      inClinic: !!doctor.in_clinic,
      image: imageUrl,
      intro: doctor.intro || "",
      qualifications: qualifications,
      clinicName: clinicName,
      locality: locality,
    }
  }

  // Fetch doctors data on component mount
  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true)
        const response = await fetch("https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json")

        if (!response.ok) {
          throw new Error("Failed to fetch doctors")
        }

        const data = await response.json()

        // Log the first doctor to understand the data structure
        if (data.length > 0) {
          console.log("First doctor data:", data[0])
        }

        const normalizedData = Array.isArray(data) ? data.map(normalizeDoctor) : []
        setDoctors(normalizedData)
      } catch (err) {
        setError("Failed to load doctors. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, []) // Empty dependency array means this runs once on mount

  // Handle search input
  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set("search", query)
      } else {
        params.delete("search")
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  // Handle filter changes
  const handleFilterChange = useCallback(
    (type: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString())

      if (type === "consultationType") {
        if (value) {
          params.set("consultationType", value as string)
        } else {
          params.delete("consultationType")
        }
      } else if (type === "specialties") {
        if ((value as string[]).length > 0) {
          params.set("specialties", (value as string[]).join(","))
        } else {
          params.delete("specialties")
        }
      } else if (type === "sortBy") {
        if (value) {
          params.set("sortBy", value as string)
        } else {
          params.delete("sortBy")
        }
      }

      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  // Handle clearing all filters
  const handleClearFilters = useCallback(() => {
    // Clear all filters by pushing to the base URL without any query parameters
    router.push("/")

    // For immediate UI update, we can also reset the local state
    // This ensures the UI updates immediately even before the router navigation completes
    const searchInput = document.querySelector('[data-testid="autocomplete-input"]') as HTMLInputElement
    if (searchInput) {
      searchInput.value = ""
    }

    // Log that filters were cleared
    console.log("All filters cleared")
  }, [router])

  // Apply filters to get filtered doctors
  const getFilteredDoctors = useCallback(() => {
    let result = [...doctors]

    // Apply consultation type filter
    if (consultationType) {
      result = result.filter((doctor) => {
        if (consultationType === "Video Consult") {
          return doctor.videoConsult
        } else if (consultationType === "In Clinic") {
          return doctor.inClinic
        }
        return true
      })
    }

    // Apply specialties filter
    if (specialties.length > 0) {
      result = result.filter((doctor) => specialties.some((specialty) => doctor.specialties?.includes(specialty)))
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter((doctor) => doctor.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply sorting
    if (sortBy) {
      if (sortBy === "fees-low-to-high") {
        result.sort((a, b) => a.fees - b.fees)
      } else if (sortBy === "experience") {
        result.sort((a, b) => b.experience - a.experience)
      }
    }

    return result
  }, [doctors, consultationType, specialties, searchQuery, sortBy])

  // Get filtered doctors
  const filteredDoctors = getFilteredDoctors()

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>
  }

  const hasActiveFilters = searchQuery || consultationType || specialties.length > 0 || sortBy

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 p-4">
        <div className="container mx-auto">
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} doctors={doctors} />
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-blue-600 text-sm hover:underline"
                    data-testid="clear-all-btn"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <FilterPanel
                doctors={doctors}
                consultationType={consultationType}
                specialties={specialties}
                sortBy={sortBy}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="w-full md:w-3/4">
            <DoctorList doctors={filteredDoctors} />
          </div>
        </div>
      </div>
    </main>
  )
}
