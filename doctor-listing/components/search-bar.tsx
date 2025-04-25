"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { Doctor } from "@/types"

interface SearchBarProps {
  onSearch: (query: string) => void
  initialQuery?: string
  doctors: Doctor[]
}

export default function SearchBar({ onSearch, initialQuery = "", doctors }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Doctor[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Update suggestions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const matchedDoctors = doctors
      .filter((doctor) => doctor.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3) // Show only top 3 matches

    setSuggestions(matchedDoctors)
  }, [query, doctors])

  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update query when initialQuery changes (from URL)
  useEffect(() => {
    setQuery(initialQuery)
    // If initialQuery is empty and the previous query wasn't, it means filters were cleared
    if (!initialQuery && query) {
      console.log("Search query cleared")
    }
  }, [initialQuery, query])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowSuggestions(true)
  }, [])

  const handleSuggestionClick = useCallback(
    (doctorName: string) => {
      setQuery(doctorName)
      onSearch(doctorName)
      setShowSuggestions(false)
    },
    [onSearch],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSearch(query)
      setShowSuggestions(false)
    },
    [query, onSearch],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && suggestions.length > 0) {
        e.preventDefault()
        handleSuggestionClick(suggestions[0].name)
      }
    },
    [suggestions, handleSuggestionClick],
  )

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <input
          data-testid="autocomplete-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search Symptoms, Doctors, Specialists, Clinics"
          className="w-full p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg"
        >
          {suggestions.map((doctor) => (
            <div
              key={doctor.id}
              data-testid="suggestion-item"
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0 flex items-center gap-3"
              onClick={() => handleSuggestionClick(doctor.name)}
            >
              <img
                src={doctor.image || "/placeholder.svg"}
                alt={doctor.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // If image fails to load, replace with placeholder
                  const target = e.target as HTMLImageElement
                  target.onerror = null // Prevent infinite loop
                  target.src = `/placeholder.svg?height=40&width=40&query=doctor ${doctor.name}`
                }}
              />
              <div>
                <div className="font-medium">{doctor.name}</div>
                <div className="text-sm text-gray-500">
                  {doctor.specialties && doctor.specialties.length > 0
                    ? typeof doctor.specialties[0] === "string"
                      ? doctor.specialties[0]
                      : JSON.stringify(doctor.specialties[0])
                    : "Doctor"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
