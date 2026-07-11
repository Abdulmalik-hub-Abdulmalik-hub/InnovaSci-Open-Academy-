"use client"

import { useState, useEffect } from "react"
import { Search, X, Loader2, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Domain, Category, UseDomainFilterReturn } from "@/hooks/useDomainFilter"

interface DomainFilterSelectProps {
  domains: Domain[]
  value: string
  onChange: (domainId: string) => void
  loading?: boolean
  className?: string
}

export function DomainFilterSelect({ 
  domains, 
  value, 
  onChange, 
  loading,
  className 
}: DomainFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedDomain = domains.find(d => d.id === value)
  
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 flex items-center justify-between rounded-lg border border-input bg-background hover:border-[hsl(var(--brand-purple))/50] transition-colors text-sm"
      >
        <span className={cn(!value && "text-muted-foreground")}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
          ) : (
            <LayoutGrid className="h-4 w-4 inline mr-2 opacity-50" />
          )}
          {selectedDomain 
            ? `${selectedDomain.icon ? selectedDomain.icon + " " : ""}${selectedDomain.name}`
            : "All Domains"
          }
        </span>
        <span className="text-muted-foreground">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(""); setIsOpen(false); }}
            className={cn(
              "w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2",
              !value && "bg-accent"
            )}
          >
            <LayoutGrid className="h-4 w-4 opacity-50" />
            <span className="font-medium">All Domains</span>
          </button>
          {domains.map((domain) => (
            <button
              key={domain.id}
              type="button"
              onClick={() => { onChange(domain.id); setIsOpen(false); }}
              className={cn(
                "w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2",
                value === domain.id && "bg-accent"
              )}
            >
              {domain.icon && <span className="text-lg">{domain.icon}</span>}
              {domain.color && (
                <span 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: domain.color }} 
                />
              )}
              <span className="font-medium truncate">{domain.name}</span>
              {domain.courseCount !== undefined && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {domain.courseCount} courses
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface CategoryFilterSelectProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function CategoryFilterSelect({ 
  categories, 
  value, 
  onChange, 
  disabled,
  placeholder = "All Categories",
  className 
}: CategoryFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedCategory = categories.find(c => c.id === value)
  
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-10 px-3 flex items-center justify-between rounded-lg border border-input bg-background transition-colors text-sm",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:border-[hsl(var(--brand-purple))/50]"
        )}
      >
        <span className={cn(!value && "text-muted-foreground", disabled && "text-muted-foreground")}>
          {selectedCategory?.name || placeholder}
        </span>
        {!disabled && <span className="text-muted-foreground">{isOpen ? "▲" : "▼"}</span>}
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(""); setIsOpen(false); }}
            className={cn(
              "w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors",
              !value && "bg-accent"
            )}
          >
            {placeholder}
          </button>
          {categories.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No categories available
            </div>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { onChange(cat.id); setIsOpen(false); }}
                className={cn(
                  "w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors",
                  value === cat.id && "bg-accent"
                )}
              >
                <span className="font-medium truncate">{cat.name}</span>
                {cat.courseCount !== undefined && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({cat.courseCount})
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface DifficultyFilterSelectProps {
  value: string
  onChange: (difficulty: string) => void
  difficulties?: readonly string[]
  className?: string
}

export function DifficultyFilterSelect({ 
  value, 
  onChange, 
  difficulties = ["All Levels", "BEGINNER", "INTERMEDIATE", "ADVANCED"],
  className 
}: DifficultyFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const getLabel = (diff: string) => {
    switch (diff) {
      case "BEGINNER": return "Beginner"
      case "INTERMEDIATE": return "Intermediate"
      case "ADVANCED": return "Advanced"
      default: return diff
    }
  }
  
  const colors: Record<string, string> = {
    BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }
  
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 flex items-center justify-between rounded-lg border border-input bg-background hover:border-[hsl(var(--brand-purple))/50] transition-colors text-sm"
      >
        <span className={cn(value === "All Levels" && "text-muted-foreground")}>
          {value === "All Levels" ? "All Levels" : getLabel(value)}
        </span>
        <span className="text-muted-foreground">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50">
          {difficulties.map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => { onChange(diff); setIsOpen(false); }}
              className={cn(
                "w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors",
                value === diff && "bg-accent"
              )}
            >
              {diff === "BEGINNER" || diff === "INTERMEDIATE" || diff === "ADVANCED" ? (
                <Badge className={cn(colors[diff])} variant="secondary">
                  {getLabel(diff)}
                </Badge>
              ) : (
                <span className="font-medium">{diff}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ActiveFiltersProps {
  filters: {
    searchQuery: string
    selectedDomain: string
    selectedCategory: string
    selectedDifficulty: string
  }
  domains: Domain[]
  categories: Category[]
  onClearSearch: () => void
  onClearDomain: () => void
  onClearCategory: () => void
  onClearDifficulty: () => void
  onClearAll: () => void
}

export function ActiveFilters({
  filters,
  domains,
  categories,
  onClearSearch,
  onClearDomain,
  onClearCategory,
  onClearDifficulty,
  onClearAll
}: ActiveFiltersProps) {
  const hasFilters = filters.searchQuery || filters.selectedDomain || 
                     filters.selectedCategory || filters.selectedDifficulty !== "All Levels"
  
  if (!hasFilters) return null
  
  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "BEGINNER": return "Beginner"
      case "INTERMEDIATE": return "Intermediate"
      case "ADVANCED": return "Advanced"
      default: return diff
    }
  }
  
  const selectedDomain = domains.find(d => d.id === filters.selectedDomain)
  const selectedCategory = categories.find(c => c.id === filters.selectedCategory)
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {filters.searchQuery && (
        <Badge variant="secondary" className="gap-1">
          Search: {filters.searchQuery}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearSearch} />
        </Badge>
      )}
      
      {filters.selectedDomain && selectedDomain && (
        <Badge 
          variant="secondary" 
          className="gap-1"
          style={{ borderColor: selectedDomain.color || '#6366f1', color: selectedDomain.color || '#6366f1' }}
        >
          {selectedDomain.icon && <span>{selectedDomain.icon}</span>}
          {selectedDomain.name}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearDomain} />
        </Badge>
      )}
      
      {filters.selectedCategory && selectedCategory && (
        <Badge variant="secondary" className="gap-1">
          {selectedCategory.name}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearCategory} />
        </Badge>
      )}
      
      {filters.selectedDifficulty !== "All Levels" && (
        <Badge variant="secondary" className="gap-1">
          {getDifficultyLabel(filters.selectedDifficulty)}
          <X className="h-3 w-3 cursor-pointer" onClick={onClearDifficulty} />
        </Badge>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClearAll}
        className="text-xs h-7"
      >
        Clear All
      </Button>
    </div>
  )
}

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search courses...",
  className 
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-10", className)}
      />
    </div>
  )
}

// Complete search filters bar component
interface CourseSearchFiltersProps {
  filters: {
    searchQuery: string
    selectedDomain: string
    selectedCategory: string
    selectedDifficulty: string
  }
  domains: Domain[]
  categories: Category[]
  totalCourses: number
  loading?: boolean
  onSearchChange: (query: string) => void
  onDomainChange: (domainId: string) => void
  onCategoryChange: (categoryId: string) => void
  onDifficultyChange: (difficulty: string) => void
  onClearAll: () => void
  showSearch?: boolean
  showCategory?: boolean
  className?: string
}

export function CourseSearchFilters({
  filters,
  domains,
  categories,
  totalCourses,
  loading,
  onSearchChange,
  onDomainChange,
  onCategoryChange,
  onDifficultyChange,
  onClearAll,
  showSearch = true,
  showCategory = true,
  className
}: CourseSearchFiltersProps) {
  const filteredCategories = filters.selectedDomain 
    ? categories.filter(c => c.domainId === filters.selectedDomain)
    : categories
  
  const hasActiveFilters = filters.searchQuery || filters.selectedDomain || 
                           filters.selectedCategory || filters.selectedDifficulty !== "All Levels"
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        {showSearch && (
          <div className="flex-1 min-w-[200px] max-w-md">
            <SearchInput
              value={filters.searchQuery}
              onChange={onSearchChange}
            />
          </div>
        )}
        
        <DomainFilterSelect
          domains={domains}
          value={filters.selectedDomain}
          onChange={onDomainChange}
          loading={loading}
          className="w-[180px]"
        />
        
        {showCategory && (
          <CategoryFilterSelect
            categories={filteredCategories}
            value={filters.selectedCategory}
            onChange={onCategoryChange}
            disabled={!!(filters.selectedDomain && filteredCategories.length === 0)}
            className="w-[180px]"
          />
        )}
        
        <DifficultyFilterSelect
          value={filters.selectedDifficulty}
          onChange={onDifficultyChange}
          className="w-[150px]"
        />
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                Searching...
              </>
            ) : (
              <>
                <strong>{totalCourses}</strong> courses found
              </>
            )}
          </span>
          
          <div className="flex flex-wrap gap-2 ml-auto">
            {filters.searchQuery && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => onSearchChange("")}>
                Search: {filters.searchQuery}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.selectedDomain && (
              <Badge 
                variant="secondary" 
                className="gap-1 cursor-pointer" 
                onClick={() => onDomainChange("")}
                style={{ borderColor: domains.find(d => d.id === filters.selectedDomain)?.color || undefined }}
              >
                {domains.find(d => d.id === filters.selectedDomain)?.icon}
                {domains.find(d => d.id === filters.selectedDomain)?.name}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.selectedCategory && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => onCategoryChange("")}>
                {categories.find(c => c.id === filters.selectedCategory)?.name}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {filters.selectedDifficulty !== "All Levels" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => onDifficultyChange("All Levels")}>
                {filters.selectedDifficulty === "BEGINNER" ? "Beginner" : 
                 filters.selectedDifficulty === "INTERMEDIATE" ? "Intermediate" : "Advanced"}
                <X className="h-3 w-3" />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs h-7">
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
