/**
 * Seed script for default Payment Gateways
 * Run with: npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed-payment-gateways.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Default payment gateways
const DEFAULT_GATEWAYS = [
  {
    name: "Paystack",
    provider: "paystack",
    slug: "paystack",
    isEnabled: true,
    isDefault: true,
    environment: "production",
    iconName: "CreditCard",
    color: "#00C4B4",
    supportedCurrencies: ["NGN", "USD", "GHS", "KES", "ZAR"],
    supportedCountries: ["NG", "GH", "KE", "ZA", "US", "GB"],
    supportedMethods: ["card", "bank_transfer", "ussd", "mobile_money"],
    transactionFeePercent: 1.5,
    transactionFeeFixed: 0,
    currency: "NGN",
    priority: 1,
    notes: "Primary gateway for African payments. Supports NGN, USD, and African currencies.",
  },
  {
    name: "Stripe",
    provider: "stripe",
    slug: "stripe",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "CreditCard",
    color: "#635BFF",
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "NGN"],
    supportedCountries: ["US", "GB", "CA", "AU", "DE", "FR", "NG"],
    supportedMethods: ["card", "bank_transfer", "apple_pay", "google_pay"],
    transactionFeePercent: 2.9,
    transactionFeeFixed: 0.30,
    currency: "USD",
    priority: 2,
    notes: "Global payment gateway. Best for USD and international payments.",
  },
  {
    name: "Flutterwave",
    provider: "flutterwave",
    slug: "flutterwave",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "CreditCard",
    color: "#F5A623",
    supportedCurrencies: ["NGN", "USD", "KES", "GHS", "UGX", "XOF", "ZAR"],
    supportedCountries: ["NG", "KE", "GH", "UG", "SN", "CI", "ZA", "US", "GB"],
    supportedMethods: ["card", "bank_transfer", "ussd", "mobile_money", "qr_code"],
    transactionFeePercent: 1.4,
    transactionFeeFixed: 0,
    currency: "NGN",
    priority: 3,
    notes: "Pan-African payment gateway. Alternative to Paystack.",
  },
  {
    name: "PayPal",
    provider: "paypal",
    slug: "paypal",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "CreditCard",
    color: "#003087",
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
    supportedCountries: ["US", "GB", "CA", "AU", "DE", "FR", "JP"],
    supportedMethods: ["paypal", "card"],
    transactionFeePercent: 3.49,
    transactionFeeFixed: 0.49,
    currency: "USD",
    priority: 4,
    notes: "Global payment option. Popular for international transactions.",
  },
  {
    name: "Paddle",
    provider: "paddle",
    slug: "paddle",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "CreditCard",
    color: "#F5F5F5",
    supportedCurrencies: ["USD", "EUR", "GBP"],
    supportedCountries: ["US", "GB", "CA", "AU", "DE", "FR"],
    supportedMethods: ["card", "paypal", "apple_pay", "google_pay"],
    transactionFeePercent: 5.0,
    transactionFeeFixed: 0,
    currency: "USD",
    priority: 5,
    notes: "Developer-friendly. Good for SaaS and digital products.",
  },
  {
    name: "Razorpay",
    provider: "razorpay",
    slug: "razorpay",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "CreditCard",
    color: "#0066FF",
    supportedCurrencies: ["INR", "USD"],
    supportedCountries: ["IN", "US", "GB"],
    supportedMethods: ["card", "bank_transfer", "upi", "wallet", "emi"],
    transactionFeePercent: 2.0,
    transactionFeeFixed: 0,
    currency: "INR",
    priority: 6,
    notes: "Indian payment gateway. Best for INR payments.",
  },
  {
    name: "Bank Transfer",
    provider: "bank_transfer",
    slug: "bank-transfer",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "Building",
    color: "#10B981",
    supportedCurrencies: ["NGN", "USD", "EUR", "GBP"],
    supportedCountries: ["NG", "US", "GB", "DE"],
    supportedMethods: ["bank_transfer"],
    transactionFeePercent: 0,
    transactionFeeFixed: 0,
    currency: "USD",
    priority: 10,
    notes: "Manual bank transfer. Requires manual verification.",
  },
  {
    name: "Manual Payment",
    provider: "manual",
    slug: "manual-payment",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "FileText",
    color: "#6B7280",
    supportedCurrencies: ["NGN", "USD", "EUR", "GBP"],
    supportedCountries: ["NG", "US", "GB", "DE", "FR"],
    supportedMethods: ["cash", "cheque", "other"],
    transactionFeePercent: 0,
    transactionFeeFixed: 0,
    currency: "USD",
    priority: 100,
    notes: "Cash or cheque payment. Requires admin verification.",
  },
  {
    name: "Crypto Payments",
    provider: "crypto",
    slug: "crypto",
    isEnabled: false,
    isDefault: false,
    environment: "production",
    iconName: "Bitcoin",
    color: "#F7931A",
    supportedCurrencies: ["USD", "EUR", "BTC", "ETH", "USDT", "USDC"],
    supportedCountries: ["US", "GB", "DE", "FR"],
    supportedMethods: ["crypto"],
    transactionFeePercent: 1.0,
    transactionFeeFixed: 0,
    currency: "USD",
    priority: 20,
    notes: "Cryptocurrency payments via Coinbase Commerce or similar.",
  },
]

// Default payment settings
const DEFAULT_PAYMENT_SETTINGS = {
  defaultCurrency: "USD",
  supportedCurrencies: ["NGN", "USD", "EUR", "GBP"],
  exchangeRateMode: "automatic",
  autoUpdateRates: true,
  updateIntervalHours: 24,
  paymentTimeout: 30,
  retryAttempts: 3,
  refundEnabled: true,
  refundWindowDays: 7,
  webhookEnabled: true,
  webhookRetries: 3,
  invoicePrefix: "INV",
  invoiceAutoNumber: true,
  receiptEnabled: true,
  receiptEmailEnabled: true,
  taxEnabled: false,
  taxRate: 0,
  taxName: "Tax",
  platformFeePercent: 0,
  platformFeeFixed: 0,
}

// Country to currency mapping
const COUNTRY_CURRENCY_MAPPING = [
  { country: "NG", countryName: "Nigeria", currency: "NGN" },
  { country: "US", countryName: "United States", currency: "USD" },
  { country: "GB", countryName: "United Kingdom", currency: "GBP" },
  { country: "CA", countryName: "Canada", currency: "CAD" },
  { country: "AU", countryName: "Australia", currency: "AUD" },
  { country: "DE", countryName: "Germany", currency: "EUR" },
  { country: "FR", countryName: "France", currency: "EUR" },
  { country: "GH", countryName: "Ghana", currency: "GHS" },
  { country: "KE", countryName: "Kenya", currency: "KES" },
  { country: "ZA", countryName: "South Africa", currency: "ZAR" },
  { country: "UG", countryName: "Uganda", currency: "UGX" },
  { country: "IN", countryName: "India", currency: "INR" },
  { country: "JP", countryName: "Japan", currency: "JPY" },
]

async function seedPaymentGateways() {
  console.log("💳 Seeding payment gateways...\n")

  let created = 0
  let updated = 0
  let skipped = 0

  // Seed gateways
  for (const gateway of DEFAULT_GATEWAYS) {
    const existing = await prisma.paymentGateway.findFirst({
      where: { OR: [{ slug: gateway.slug }, { name: gateway.name }] },
    })

    if (existing) {
      // Update existing gateway
      await prisma.paymentGateway.update({
        where: { id: existing.id },
        data: {
          provider: gateway.provider,
          isEnabled: gateway.isEnabled,
          isDefault: gateway.isDefault,
          environment: gateway.environment,
          iconName: gateway.iconName,
          color: gateway.color,
          supportedCurrencies: gateway.supportedCurrencies,
          supportedCountries: gateway.supportedCountries,
          supportedMethods: gateway.supportedMethods,
          transactionFeePercent: gateway.transactionFeePercent,
          transactionFeeFixed: gateway.transactionFeeFixed,
          currency: gateway.currency,
          priority: gateway.priority,
          notes: gateway.notes,
        },
      })
      console.log(`  ✏️  Updated: ${gateway.name}`)
      updated++
    } else {
      // Create new gateway
      await prisma.paymentGateway.create({
        data: gateway as any,
      })
      console.log(`  ✅ Created: ${gateway.name}`)
      created++
    }
  }

  // Seed payment settings
  const existingSettings = await prisma.paymentSettings.findFirst()
  if (existingSettings) {
    await prisma.paymentSettings.update({
      where: { id: existingSettings.id },
      data: DEFAULT_PAYMENT_SETTINGS,
    })
    console.log(`  ✏️  Updated: Payment Settings`)
    updated++
  } else {
    await prisma.paymentSettings.create({
      data: DEFAULT_PAYMENT_SETTINGS,
    })
    console.log(`  ✅ Created: Payment Settings`)
    created++
  }

  // Seed exchange rates
  const exchangeRates = [
    { fromCurrency: "NGN", toCurrency: "USD", rate: 0.00065, isAutomatic: false },
    { fromCurrency: "EUR", toCurrency: "USD", rate: 1.10, isAutomatic: false },
    { fromCurrency: "GBP", toCurrency: "USD", rate: 1.27, isAutomatic: false },
    { fromCurrency: "CAD", toCurrency: "USD", rate: 0.74, isAutomatic: false },
    { fromCurrency: "AUD", toCurrency: "USD", rate: 0.65, isAutomatic: false },
    { fromCurrency: "JPY", toCurrency: "USD", rate: 0.0067, isAutomatic: false },
    { fromCurrency: "GHS", toCurrency: "USD", rate: 0.082, isAutomatic: false },
    { fromCurrency: "KES", toCurrency: "USD", rate: 0.0077, isAutomatic: false },
    { fromCurrency: "ZAR", toCurrency: "USD", rate: 0.053, isAutomatic: false },
    { fromCurrency: "INR", toCurrency: "USD", rate: 0.012, isAutomatic: false },
  ]

  for (const rate of exchangeRates) {
    const existing = await prisma.exchangeRate.findFirst({
      where: { fromCurrency: rate.fromCurrency, toCurrency: rate.toCurrency },
    })

    if (!existing) {
      await prisma.exchangeRate.create({ data: rate })
      console.log(`  ✅ Created: Exchange rate ${rate.fromCurrency} → ${rate.toCurrency}`)
      created++
    }
  }

  console.log("\n📊 Seed Summary:")
  console.log(`   Gateways Created: ${created}`)
  console.log(`   Gateways Updated: ${updated}`)
  console.log(`   Total Changes: ${created + updated}`)

  // Display all gateways
  const allGateways = await prisma.paymentGateway.findMany({
    orderBy: { priority: "asc" },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  })

  console.log("\n💳 All Payment Gateways:")
  console.log("─".repeat(80))
  console.log("Name".padEnd(20) + "Provider".padEnd(15) + "Status".padEnd(12) + "Priority".padEnd(10) + "Transactions")
  console.log("─".repeat(80))
  for (const g of allGateways) {
    const status = g.isEnabled ? "✓ Enabled" : "○ Disabled"
    console.log(
      g.name.substring(0, 19).padEnd(20) +
      g.provider.substring(0, 14).padEnd(15) +
      status.padEnd(12) +
      g.priority.toString().padEnd(10) +
      g._count.transactions.toString()
    )
  }
  console.log("─".repeat(80))
}

async function main() {
  try {
    await seedPaymentGateways()
  } catch (error) {
    console.error("❌ Error seeding payment gateways:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log("\n✨ Seeding completed successfully!")
    process.exit(0)
  })
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
