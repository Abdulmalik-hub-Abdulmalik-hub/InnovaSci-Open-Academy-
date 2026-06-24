"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Send, CheckCircle } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsLoading(false)
    setEmail("")
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-brand-purple/10 via-brand-blue/10 to-brand-teal/10 border-brand-purple/20">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-brand-purple/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-brand-purple" />
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                Stay Updated with InnovaSci
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Subscribe to our newsletter for the latest courses, research updates, and exclusive learning opportunities.
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-brand-purple hover:bg-brand-purple/90"
                  >
                    {isLoading ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <>
                        Subscribe
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 text-green-600"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Thank you for subscribing!</span>
                </motion.div>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
