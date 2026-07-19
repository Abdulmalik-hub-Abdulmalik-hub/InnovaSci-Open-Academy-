"use client"

import { useState, useEffect, useMemo } from "react"
import { useStudentProfile } from "@/hooks/useStudentProfile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  User, Clock, Calendar, Upload, Loader2, 
  CheckCircle2, Globe, Phone, MapPin, CreditCard, Bell, Lock,
  ChevronDown
} from "lucide-react"
import { 
  countries, 
  getCountryByCode, 
  getStatesByCountry, 
  hasStates,
  getCitiesByState,
  hasCities,
  getTimezoneOptions,
  getAvailableGateways
} from "@/lib/countries"

export default function ProfileSettingsPage() {
  const { user, profile, stats, loading, updateProfile, uploadAvatar } = useStudentProfile()
  const { toast } = useToast()
  
  // Personal Information
  const [fullName, setFullName] = useState(profile?.fullName || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "")
  
  // Contact Information
  const [phone, setPhone] = useState(profile?.phone || "")
  
  // Location
  const [countryCode, setCountryCode] = useState(profile?.countryCode || "")
  const [selectedCountry, setSelectedCountry] = useState<typeof countries[0] | null>(null)
  const [stateCode, setStateCode] = useState(profile?.stateCode || "")
  const [selectedState, setSelectedState] = useState(profile?.state || "")
  const [city, setCity] = useState(profile?.city || "")
  const [streetAddress, setStreetAddress] = useState(profile?.streetAddress || "")
  const [postalCode, setPostalCode] = useState(profile?.postalCode || "")
  
  // Localization
  const [timezone, setTimezone] = useState(profile?.timezone || "")
  const [language, setLanguage] = useState(profile?.language || "English")
  const [currency, setCurrency] = useState(profile?.currency || "")
  const [currencySymbol, setCurrencySymbol] = useState(profile?.currencySymbol || "$")
  const [preferredGateway, setPreferredGateway] = useState(profile?.preferredGateway || "stripe")
  
  // UI States
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showStateDropdown, setShowStateDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [stateSearch, setStateSearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  
  // Active section
  const [activeSection, setActiveSection] = useState("personal")

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "")
      setBio(profile.bio || "")
      setAvatarUrl(profile.avatarUrl || "")
      setPhone(profile.phone || "")
      setCountryCode(profile.countryCode || "")
      setSelectedState(profile.state || "")
      setStateCode(profile.stateCode || "")
      setCity(profile.city || "")
      setStreetAddress(profile.streetAddress || "")
      setPostalCode(profile.postalCode || "")
      setTimezone(profile.timezone || "")
      setLanguage(profile.language || "English")
      setCurrency(profile.currency || "")
      setCurrencySymbol(profile.currencySymbol || "$")
      setPreferredGateway(profile.preferredGateway || "stripe")
      
      // Set selected country
      if (profile.countryCode) {
        const country = getCountryByCode(profile.countryCode)
        if (country) setSelectedCountry(country)
      }
    }
  }, [profile])

  // Update country details when country changes
  useEffect(() => {
    if (countryCode) {
      const country = getCountryByCode(countryCode)
      if (country) {
        setSelectedCountry(country)
        if (!timezone) setTimezone(country.timezone)
        if (!currency) setCurrency(country.currency)
        if (!currencySymbol) setCurrencySymbol(country.currencySymbol)
        if (!preferredGateway || preferredGateway === "stripe") {
          setPreferredGateway(country.paymentGateways[0] || "stripe")
        }
      }
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

  // Get available gateways
  const availableGateways = useMemo(() => {
    if (!countryCode) return []
    return getAvailableGateways(countryCode)
  }, [countryCode])

  // Filtered countries
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries
    const query = countrySearch.toLowerCase()
    return countries.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query)
    ).slice(0, 10)
  }, [countrySearch])

  // Filtered states
  const filteredStates = useMemo(() => {
    if (!stateSearch) return availableStates
    const query = stateSearch.toLowerCase()
    return availableStates.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query)
    )
  }, [availableStates, stateSearch])

  // Filtered cities
  const filteredCities = useMemo(() => {
    if (!citySearch) return availableCities
    const query = citySearch.toLowerCase()
    return availableCities.filter(c => c.toLowerCase().includes(query))
  }, [availableCities, citySearch])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      toast({ title: "File too large", description: "Image must be under 500KB", variant: "destructive" })
      return
    }

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast({ title: "Invalid file type", description: "Only JPEG, PNG, GIF, and WebP images are allowed", variant: "destructive" })
      return
    }

    setUploadingAvatar(true)
    const result = await uploadAvatar(file)
    setUploadingAvatar(false)

    if (result.success) {
      setAvatarUrl(result.avatarUrl || "")
      toast({ title: "Avatar updated", description: "Your profile picture has been updated" })
    } else {
      toast({ title: "Upload failed", description: result.error || "Failed to upload image", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await updateProfile({
      fullName,
      bio,
      phone,
      country: selectedCountry?.name || "",
      countryCode,
      state: selectedState,
      stateCode,
      city,
      streetAddress,
      postalCode,
      timezone,
      language,
      currency,
      currencySymbol,
      preferredGateway
    })
    setSaving(false)

    if (result.success) {
      toast({ title: "Profile updated", description: "Your changes have been saved" })
    } else {
      toast({ title: "Update failed", description: result.error || "Failed to update profile", variant: "destructive" })
    }
  }

  const sections = [
    { id: "personal", label: "Personal Information", icon: User },
    { id: "contact", label: "Contact Information", icon: Phone },
    { id: "location", label: "Location", icon: MapPin },
    { id: "payment", label: "Payment Preferences", icon: CreditCard },
    { id: "localization", label: "Language & Timezone", icon: Globe },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.coursesCompleted || 0}</p>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-full bg-brand-purple/10 dark:bg-brand-purple/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-brand-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalHoursLearned || 0}h</p>
              <p className="text-sm text-muted-foreground">Total Hours Learned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats?.memberSince 
                  ? new Date(stats.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "-"
                }
              </p>
              <p className="text-sm text-muted-foreground">Member Since</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-brand-purple text-white"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal Information */}
          {activeSection === "personal" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                        <User className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-brand-purple hover:bg-brand-purple/90 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 text-white" />
                      )}
                      <input id="avatar-upload" type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    </label>
                  </div>
                  <div>
                    <p className="font-medium">Profile Picture</p>
                    <p className="text-sm text-muted-foreground">JPG, PNG, GIF, or WebP. Max 500KB.</p>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <Input value={user?.email || ""} disabled className="mt-1 bg-gray-50 dark:bg-gray-800" />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your display name" className="mt-1" maxLength={100} />
                  <p className="text-xs text-muted-foreground mt-1">{fullName.length}/100 characters</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="mt-1 resize-none" rows={4} maxLength={500} />
                  <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 characters</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {activeSection === "contact" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </label>
                  <div className="flex gap-2 mt-1">
                    {selectedCountry && (
                      <div className="flex items-center h-10 px-3 bg-muted rounded-md text-sm text-muted-foreground">
                        {selectedCountry.flag} {selectedCountry.callingCode}
                      </div>
                    )}
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          {activeSection === "location" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Country */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Country <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {selectedCountry ? (
                        <span className="flex items-center gap-2">
                          <span>{selectedCountry.flag}</span>
                          <span>{selectedCountry.name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select country</span>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                        <div className="p-2">
                          <Input placeholder="Search country..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="mb-2" autoFocus />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCountries.map((country) => (
                            <button key={country.code} type="button" onClick={() => { setCountryCode(country.code); setSelectedCountry(country); setCountrySearch(""); setShowCountryDropdown(false); setStateCode(""); setCity(""); }} className={cn("w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2", country.code === countryCode && "bg-muted")}>
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* State/Province */}
                {countryCode && hasStates(countryCode) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State / Province</label>
                    <div className="relative">
                      <button type="button" onClick={() => setShowStateDropdown(!showStateDropdown)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {selectedState ? <span>{selectedState}</span> : <span className="text-muted-foreground">Select state/province</span>}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {showStateDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                          <div className="p-2">
                            <Input placeholder="Search state..." value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} className="mb-2" autoFocus />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredStates.map((state) => (
                              <button key={state.code} type="button" onClick={() => { setStateCode(state.code); setSelectedState(state.name); setStateSearch(""); setShowStateDropdown(false); setCity(""); }} className={cn("w-full px-3 py-2 text-left text-sm hover:bg-muted", state.code === stateCode && "bg-muted")}>
                                {state.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* City */}
                {countryCode && stateCode && hasCities(countryCode, stateCode) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <div className="relative">
                      <button type="button" onClick={() => setShowCityDropdown(!showCityDropdown)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {city ? <span>{city}</span> : <span className="text-muted-foreground">Select city</span>}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {showCityDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                          <div className="p-2">
                            <Input placeholder="Search city..." value={citySearch} onChange={(e) => setCitySearch(e.target.value)} className="mb-2" autoFocus />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {filteredCities.map((c) => (
                              <button key={c} type="button" onClick={() => { setCity(c); setCitySearch(""); setShowCityDropdown(false); }} className={cn("w-full px-3 py-2 text-left text-sm hover:bg-muted", c === city && "bg-muted")}>
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
                <div>
                  <label className="text-sm font-medium">Street Address</label>
                  <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="123 Main Street" className="mt-1" />
                </div>

                {/* Postal Code */}
                {countryCode && (
                  <div>
                    <label className="text-sm font-medium">Postal / ZIP Code</label>
                    <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" className="mt-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Preferences */}
          {activeSection === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <div className="flex items-center gap-4 mt-1 p-4 bg-muted rounded-lg">
                    <span className="text-2xl">{currencySymbol}</span>
                    <div>
                      <p className="font-medium">{currency || "Not set"}</p>
                      <p className="text-sm text-muted-foreground">Automatically set based on your country</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Preferred Payment Gateway</label>
                  <p className="text-xs text-muted-foreground mb-2">Available payment methods for your country:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableGateways.filter(g => g.available).map((gateway) => (
                      <button
                        key={gateway.id}
                        type="button"
                        onClick={() => setPreferredGateway(gateway.id)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors",
                          preferredGateway === gateway.id
                            ? "border-brand-purple bg-brand-purple/10 text-brand-purple"
                            : "border-input hover:bg-muted"
                        )}
                      >
                        <CreditCard className="h-4 w-4" />
                        {gateway.name}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Language & Timezone */}
          {activeSection === "localization" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language & Timezone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select timezone</option>
                    {getTimezoneOptions().map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Korean">Korean</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-brand-purple hover:bg-brand-purple/90">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}