"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Loader2, Globe, Phone, MapPin, ChevronDown } from "lucide-react"
import { AcademyLogo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { 
  countries, 
  getCountryByCode, 
  getStatesByCountry, 
  hasStates,
  getCitiesByState,
  hasCities,
  getTimezoneOptions
} from "@/lib/countries"

// Secure email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  // Location fields
  const [countryCode, setCountryCode] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<typeof countries[0] | null>(null)
  const [stateCode, setStateCode] = useState("")
  const [selectedState, setSelectedState] = useState<string>("")
  const [city, setCity] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [phone, setPhone] = useState("")
  const [timezone, setTimezone] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showStateDropdown, setShowStateDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [stateSearchQuery, setStateSearchQuery] = useState("")
  const [citySearchQuery, setCitySearchQuery] = useState("")
  
  // Detected timezone
  const [detectedTimezone, setDetectedTimezone] = useState("")

  // Detect user's timezone on mount
  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setDetectedTimezone(userTimezone)
    setTimezone(userTimezone)
  }, [])

  // Update country details when country is selected
  useEffect(() => {
    if (countryCode) {
      const country = getCountryByCode(countryCode)
      if (country) {
        setSelectedCountry(country)
        setTimezone(country.timezone)
      }
      setStateCode("")
      setCity("")
    } else {
      setSelectedCountry(null)
    }
  }, [countryCode])

  // Get states for selected country
  const availableStates = useMemo(() => {
    if (!countryCode) return []
    return getStatesByCountry(countryCode)
  }, [countryCode])

  // Get cities for selected state
  const availableCities = useMemo(() => {
    if (!countryCode || !stateCode) return []
    return getCitiesByState(countryCode, stateCode)
  }, [countryCode, stateCode])

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries
    const query = searchQuery.toLowerCase()
    return countries.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.currency.toLowerCase().includes(query)
    ).slice(0, 10)
  }, [searchQuery])

  // Filtered states for search
  const filteredStates = useMemo(() => {
    if (!stateSearchQuery) return availableStates
    const query = stateSearchQuery.toLowerCase()
    return availableStates.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query)
    )
  }, [availableStates, stateSearchQuery])

  // Filtered cities for search
  const filteredCities = useMemo(() => {
    if (!citySearchQuery) return availableCities
    const query = citySearchQuery.toLowerCase()
    return availableCities.filter(c => c.toLowerCase().includes(query))
  }, [availableCities, citySearchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!countryCode) {
      setError("Please select your country")
      return
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          // Location data
          country: selectedCountry?.name || "",
          countryCode,
          state: selectedState,
          stateCode,
          city,
          streetAddress,
          postalCode,
          phone,
          // Localization
          currency: selectedCountry?.currency || "USD",
          currencySymbol: selectedCountry?.currencySymbol || "$",
          timezone: timezone || detectedTimezone,
          preferredGateway: selectedCountry?.paymentGateways[0] || "stripe",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.")
        setIsLoading(false)
        return
      }

      // Success - redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-4">
            <AcademyLogo className="h-12 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground mt-1">Join InnovaSci Open Academy today</p>
        </div>

        {/* Signup Form */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Country (Required) */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Country <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selectedCountry ? (
                    <span className="flex items-center gap-2">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.name}</span>
                      <span className="text-muted-foreground text-xs">({selectedCountry.currency})</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select your country</span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
                
                {showCountryDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                    <div className="p-2">
                      <Input
                        placeholder="Search country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-2"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(country.code)
                            setSelectedCountry(country)
                            setSearchQuery("")
                            setShowCountryDropdown(false)
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2",
                            country.code === countryCode && "bg-muted"
                          )}
                        >
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-muted-foreground text-xs ml-auto">{country.currency}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* State/Province - Dynamic */}
            {countryCode && hasStates(countryCode) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  State / Province
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStateDropdown(!showStateDropdown)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedState ? (
                      <span>{selectedState}</span>
                    ) : (
                      <span className="text-muted-foreground">Select state/province</span>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  
                  {showStateDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                      <div className="p-2">
                        <Input
                          placeholder="Search state..."
                          value={stateSearchQuery}
                          onChange={(e) => setStateSearchQuery(e.target.value)}
                          className="mb-2"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredStates.map((state) => (
                          <button
                            key={state.code}
                            type="button"
                            onClick={() => {
                              setStateCode(state.code)
                              setSelectedState(state.name)
                              setStateSearchQuery("")
                              setShowStateDropdown(false)
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                              state.code === stateCode && "bg-muted"
                            )}
                          >
                            {state.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* City - Dynamic */}
            {countryCode && stateCode && hasCities(countryCode, stateCode) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {city ? (
                      <span>{city}</span>
                    ) : (
                      <span className="text-muted-foreground">Select city</span>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  
                  {showCityDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                      <div className="p-2">
                        <Input
                          placeholder="Search city..."
                          value={citySearchQuery}
                          onChange={(e) => setCitySearchQuery(e.target.value)}
                          className="mb-2"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCities.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setCity(c)
                              setCitySearchQuery("")
                              setShowCityDropdown(false)
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                              c === city && "bg-muted"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Street Address */}
            <div className="space-y-2">
              <label htmlFor="streetAddress" className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Street Address
              </label>
              <Input
                id="streetAddress"
                type="text"
                placeholder="123 Main Street"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone Number
              </label>
              <div className="flex gap-2">
                {selectedCountry && (
                  <div className="flex items-center h-10 px-3 bg-muted rounded-md text-sm text-muted-foreground">
                    {selectedCountry.flag} {selectedCountry.callingCode}
                  </div>
                )}
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Postal Code */}
            {countryCode && (
              <div className="space-y-2">
                <label htmlFor="postalCode" className="text-sm font-medium">
                  Postal / ZIP Code
                </label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="Postal code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 rounded border-muted-foreground"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms" className="text-brand-purple hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-brand-purple hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-purple hover:bg-brand-purple/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-brand-purple hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
